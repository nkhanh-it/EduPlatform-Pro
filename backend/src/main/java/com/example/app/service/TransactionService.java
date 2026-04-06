package com.example.app.service;

import com.example.app.dto.CheckoutRequest;
import com.example.app.dto.PaymentInitResponse;
import com.example.app.dto.RevenuePointDto;
import com.example.app.dto.RevenueSummaryDto;
import com.example.app.dto.TransactionDto;
import com.example.app.entity.Course;
import com.example.app.entity.Enrollment;
import com.example.app.entity.EnrollmentStatus;
import com.example.app.entity.PaymentMethod;
import com.example.app.entity.PaymentStatus;
import com.example.app.entity.Role;
import com.example.app.entity.Transaction;
import com.example.app.entity.User;
import com.example.app.repository.CourseRepository;
import com.example.app.repository.EnrollmentRepository;
import com.example.app.repository.TransactionRepository;
import com.example.app.security.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private static final DateTimeFormatter REVENUE_POINT_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");

    private final TransactionRepository transactionRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserService userService;
    private final VnpayService vnpayService;

    public TransactionService(TransactionRepository transactionRepository,
                              CourseRepository courseRepository,
                              EnrollmentRepository enrollmentRepository,
                              UserService userService,
                              VnpayService vnpayService) {
        this.transactionRepository = transactionRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userService = userService;
        this.vnpayService = vnpayService;
    }

    @Transactional
    public PaymentInitResponse checkout(CheckoutRequest request) {
        User user = getCurrentUser();
        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCourse(course);
        transaction.setAmount(course.getPrice() != null ? course.getPrice() : BigDecimal.ZERO);
        transaction.setMethod(request.getMethod() != null ? request.getMethod() : PaymentMethod.CARD);
        transaction.setProvider(resolveProvider(transaction.getMethod()));
        transaction.setStatus(PaymentStatus.PENDING);
        transaction.setExternalRef(buildExternalRef(transaction.getMethod()));
        transactionRepository.save(transaction);

        return new PaymentInitResponse(
            transaction.getId().toString(),
            transaction.getStatus().name(),
            vnpayService.createPaymentUrl(transaction)
        );
    }

    @Transactional(readOnly = true)
    public TransactionDto getTransaction(UUID id) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        boolean isOwner = transaction.getUser() != null && transaction.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to view this transaction");
        }

        return TransactionDto.fromEntity(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> listAdminTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(TransactionDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RevenueSummaryDto getRevenueSummary() {
        List<Transaction> transactions = transactionRepository.findAll();
        BigDecimal totalRevenue = transactions.stream()
            .filter(transaction -> transaction.getStatus() == PaymentStatus.SUCCESS)
            .map(Transaction::getAmount)
            .filter(amount -> amount != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long successfulTransactions = transactions.stream()
            .filter(transaction -> transaction.getStatus() == PaymentStatus.SUCCESS)
            .count();

        long failedTransactions = transactions.stream()
            .filter(transaction -> transaction.getStatus() == PaymentStatus.FAILED)
            .count();

        return new RevenueSummaryDto(totalRevenue, successfulTransactions, failedTransactions);
    }

    @Transactional(readOnly = true)
    public List<RevenuePointDto> getRevenuePoints() {
        Map<YearMonth, BigDecimal> revenueByMonth = transactionRepository.findAll().stream()
            .filter(transaction -> transaction.getStatus() == PaymentStatus.SUCCESS)
            .collect(Collectors.groupingBy(
                transaction -> YearMonth.from(resolveTransactionTime(transaction).atZone(ZoneId.systemDefault())),
                Collectors.mapping(
                    transaction -> transaction.getAmount() != null ? transaction.getAmount() : BigDecimal.ZERO,
                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                )
            ));

        return revenueByMonth.entrySet().stream()
            .sorted(Map.Entry.comparingByKey(Comparator.naturalOrder()))
            .map(entry -> new RevenuePointDto(entry.getKey().format(REVENUE_POINT_FORMAT), entry.getValue()))
            .collect(Collectors.toList());
    }

    @Transactional
    public String handleVnpayReturn(Map<String, String> params) {
        Transaction transaction = resolveTransaction(params);
        PaymentStatus status = applyGatewayResult(transaction, params);
        return vnpayService.buildFrontendReturnUrl(transaction, status);
    }

    @Transactional
    public Map<String, String> handleVnpayIpn(Map<String, String> params) {
        Transaction transaction = resolveTransaction(params);
        PaymentStatus status = applyGatewayResult(transaction, params);
        return vnpayService.buildIpnResponse(status);
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated request");
        }
        return userService.getByEmail(email);
    }

    private Transaction resolveTransaction(Map<String, String> params) {
        String transactionId = params.get("transactionId");
        if (transactionId != null && !transactionId.isBlank()) {
            return transactionRepository.findById(UUID.fromString(transactionId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        }

        String externalRef = params.get("vnp_TxnRef");
        if (externalRef != null && !externalRef.isBlank()) {
            return transactionRepository.findByExternalRef(externalRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing transaction reference");
    }

    private PaymentStatus applyGatewayResult(Transaction transaction, Map<String, String> params) {
        PaymentStatus status = vnpayService.resolveStatus(params);
        transaction.setStatus(status);
        transaction.setGatewayResponseCode(vnpayService.resolveGatewayResponseCode(params));
        transaction.setProvider(resolveProvider(transaction.getMethod()));
        if (status == PaymentStatus.SUCCESS) {
            transaction.setPaidAt(Instant.now());
            ensureApprovedEnrollment(transaction);
        }
        transactionRepository.save(transaction);
        return status;
    }

    private void ensureApprovedEnrollment(Transaction transaction) {
        if (transaction.getUser() == null || transaction.getCourse() == null) {
            return;
        }

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(
            transaction.getUser().getId(),
            transaction.getCourse().getId()
        ).orElseGet(() -> {
            Enrollment created = new Enrollment();
            created.setUser(transaction.getUser());
            created.setCourse(transaction.getCourse());
            created.setTotalLessons(transaction.getCourse().getTotalLessons());
            return created;
        });

        enrollment.setStatus(EnrollmentStatus.APPROVED);
        enrollment.setTotalLessons(transaction.getCourse().getTotalLessons());
        enrollmentRepository.save(enrollment);
    }

    private String resolveProvider(PaymentMethod method) {
        return method == PaymentMethod.MOMO ? "MOMO" : "VNPAY";
    }

    private String buildExternalRef(PaymentMethod method) {
        String prefix = method == PaymentMethod.MOMO ? "MOMO" : "VNPAY";
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private Instant resolveTransactionTime(Transaction transaction) {
        return transaction.getPaidAt() != null ? transaction.getPaidAt() : transaction.getCreatedAt();
    }
}
