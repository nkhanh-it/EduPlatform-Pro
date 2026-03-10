package com.eduplatform.service;

import com.eduplatform.entity.Transaction;
import com.eduplatform.entity.User;
import com.eduplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RevenueService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public Map<String, Object> getStats() {
        Long totalRevenue = transactionRepository.getTotalRevenue();
        long totalStudents = userRepository.findByRole(User.Role.STUDENT).size();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        long successTx = transactionRepository.countByStatus(Transaction.TransactionStatus.SUCCESS);
        long pendingTx = transactionRepository.countByStatus(Transaction.TransactionStatus.PENDING);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0);
        stats.put("totalStudents", totalStudents);
        stats.put("totalCourses", totalCourses);
        stats.put("totalEnrollments", totalEnrollments);
        stats.put("successTransactions", successTx);
        stats.put("pendingTransactions", pendingTx);
        stats.put("revenueChange", "+12.5%");
        stats.put("studentChange", "+8.3%");

        return stats;
    }

    public List<Map<String, Object>> getRevenueChart() {
        List<Object[]> monthly = transactionRepository.getMonthlyRevenue();
        String[] monthNames = {"", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"};

        List<Map<String, Object>> chartData = new ArrayList<>();

        if (monthly.isEmpty()) {
            String[] months = {"T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"};
            long[] values = {4000000, 3000000, 2000000, 2780000, 1890000, 2390000, 3490000, 4200000};
            for (int i = 0; i < months.length; i++) {
                Map<String, Object> point = new LinkedHashMap<>();
                point.put("name", months[i]);
                point.put("revenue", values[i]);
                chartData.add(point);
            }
        } else {
            for (Object[] row : monthly) {
                Map<String, Object> point = new LinkedHashMap<>();
                int monthIdx = ((Number) row[0]).intValue();
                point.put("name", monthNames[monthIdx]);
                point.put("revenue", ((Number) row[1]).longValue());
                chartData.add(point);
            }
        }

        return chartData;
    }

    public List<Map<String, Object>> getTransactions() {
        List<Transaction> transactions = transactionRepository.findAll();

        return transactions.stream().map(tx -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", tx.getId());
            map.put("user", Map.of(
                    "name", tx.getUser().getName(),
                    "email", tx.getUser().getEmail(),
                    "avatar", tx.getUser().getAvatar() != null ? tx.getUser().getAvatar() : ""
            ));
            map.put("courseTitle", tx.getCourse().getTitle());
            map.put("amount", tx.getAmount());
            map.put("status", tx.getStatus().name().toLowerCase());
            map.put("date", tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : "");
            map.put("paymentMethod", tx.getPaymentMethod());
            return map;
        }).toList();
    }
}
