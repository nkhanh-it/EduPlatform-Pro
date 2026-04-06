package com.example.app.service;

import com.example.app.dto.CheckoutRequest;
import com.example.app.dto.PaymentInitResponse;
import com.example.app.dto.RevenuePointDto;
import com.example.app.dto.RevenueSummaryDto;
import com.example.app.dto.TransactionDto;
import com.example.app.entity.Course;
import com.example.app.entity.Enrollment;
import com.example.app.entity.EnrollmentStatus;
import com.example.app.entity.PaymentStatus;
import com.example.app.entity.Transaction;
import com.example.app.entity.User;
import com.example.app.exception.BadRequestException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.EnrollmentRepository;
import com.example.app.repository.TransactionRepository;
import com.example.app.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private static final DateTimeFormatter REVENUE_POINT_FORMAT =
        DateTimeFormatter.ofPattern("dd/MM").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private final TransactionRepository transactionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseService courseService;
    private final UserService userService;
    private final VnpayService vnpayService;
    private final String frontendReturnUrl;

    public TransactionService(TransactionRepository transactionRepository,
                              EnrollmentRepository enrollmentRepository,
                              CourseService courseService,
                              UserService userService,
                              VnpayService vnpayService,
                              @Value("${app.payment.frontend-return-url:http://localhost:3000/checkout}") String frontendReturnUrl) {
        this.transactionRepository = transactionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseService = courseService;
        this.userService = userService;
        this.vnpayService = vnpayService;
        this.frontendReturnUrl = frontendReturnUrl;
    }

    @Transactional
    public PaymentInitResponse checkout(CheckoutRequest request, String ipAddress) {
        User user = getCurrentUser();
        Course course = courseService.getCourseEntity(request.getCourseId());
        ensureNotAlreadyEnrolled(user, course);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCourse(course);
        transaction.setAmount(course.getPrice());
        transaction.setMethod(request.getMethod());
        transaction.setStatus(PaymentStatus.PENDING);
        transaction.setProvider("VNPAY");
        transaction.setExternalRef(generateExternalRef());
        transactionRepository.save(transaction);

        String paymentUrl = vnpayService.createPaymentUrl(transaction, ipAddress);
        return new PaymentInitResponse(transaction.getId(), transaction.getStatus().name(), paymentUrl);
    }

    @Transactional(readOnly = true)
    public TransactionDto getTransaction(UUID id) {
        User currentUser = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        boolean isOwner = transaction.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());
        if (!isOwner && !isAdmin) {
            throw new BadRequestException("You are not allowed to view this transaction");
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
            .filter(tx -> tx.getStatus() == PaymentStatus.SUCCESS)
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        long successCount = transactions.stream().filter(tx -> tx.getStatus() == PaymentStatus.SUCCESS).count();
        long failedCount = transactions.stream().filter(tx -> tx.getStatus() == PaymentStatus.FAILED).count();
        return new RevenueSummaryDto(totalRevenue, successCount, failedCount);
    }

    @Transactional(readOnly = true)
    public List<RevenuePointDto> getRevenuePoints() {
        Map<LocalDate, BigDecimal> revenueByDay = transactionRepository.findAll().stream()
            .filter(tx -> tx.getStatus() == PaymentStatus.SUCCESS)
            .collect(Collectors.groupingBy(
                tx -> tx.getCreatedAt().atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate(),
                TreeMap::new,
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));

        return revenueByDay.entrySet().stream()
            .map(entry -> new RevenuePointDto(REVENUE_POINT_FORMAT.format(entry.getKey().atStartOfDay(ZoneId.of("Asia/Ho_Chi_Minh"))), entry.getValue()))
            .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new BadRequestException("Unauthenticated request");
        }
        return userService.getByEmail(email);
    }

    @Transactional
    public Transaction handleVnpayCallback(Map<String, String> params) {
        if (!vnpayService.verifyCallback(params)) {
            throw new BadRequestException("Invalid VNPAY signature");
        }

        String txnRef = params.get("vnp_TxnRef");
        Transaction transaction = transactionRepository.findByExternalRef(txnRef)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        String responseCode = params.get("vnp_ResponseCode");
        transaction.setGatewayResponseCode(responseCode);

        String amountValue = params.get("vnp_Amount");
        if (amountValue != null && !amountValue.isBlank()) {
            BigDecimal callbackAmount = new BigDecimal(amountValue).movePointLeft(2);
            if (callbackAmount.compareTo(transaction.getAmount()) != 0) {
                transaction.setStatus(PaymentStatus.FAILED);
                transactionRepository.save(transaction);
                throw new BadRequestException("Invalid payment amount");
            }
        }

        if ("00".equals(responseCode)) {
            transaction.setStatus(PaymentStatus.SUCCESS);
            if (transaction.getPaidAt() == null) {
                transaction.setPaidAt(Instant.now());
            }
            approveEnrollment(transaction);
        } else {
            transaction.setStatus(PaymentStatus.FAILED);
        }

        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public boolean verifyVnpayCallback(Map<String, String> params) {
        return vnpayService.verifyCallback(params);
    }

    @Transactional(readOnly = true)
    public Transaction findByExternalRef(String externalRef) {
        return transactionRepository.findByExternalRef(externalRef)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    public String buildFrontendReturnUrl(String status, String transactionId) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(frontendReturnUrl)
            .queryParam("paymentStatus", status);
        if (transactionId != null && !transactionId.isBlank()) {
            builder.queryParam("transactionId", transactionId);
        }
        return builder.build().toUriString();
    }

    private void approveEnrollment(Transaction transaction) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(
                transaction.getUser().getId(),
                transaction.getCourse().getId()
            )
            .orElseGet(() -> {
                Enrollment created = new Enrollment();
                created.setUser(transaction.getUser());
                created.setCourse(transaction.getCourse());
                created.setTotalLessons(transaction.getCourse().getTotalLessons());
                return created;
            });

        enrollment.setStatus(EnrollmentStatus.APPROVED);
        enrollmentRepository.save(enrollment);
    }

    private void ensureNotAlreadyEnrolled(User user, Course course) {
        enrollmentRepository.findByUserIdAndCourseId(user.getId(), course.getId())
            .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.APPROVED)
            .ifPresent(enrollment -> {
                throw new BadRequestException("Course already unlocked");
            });
    }

    private String generateExternalRef() {
        return "EDU" + UUID.randomUUID().toString().replace("-", "").substring(0, 24).toUpperCase();
    }
}
