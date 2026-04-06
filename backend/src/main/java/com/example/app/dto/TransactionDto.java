package com.example.app.dto;

import com.example.app.entity.Transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class TransactionDto {

    private UUID id;
    private UUID userId;
    private String userFullName;
    private String courseTitle;
    private BigDecimal amount;
    private String status;
    private String method;
    private String provider;
    private String externalRef;
    private String gatewayResponseCode;
    private Instant paidAt;
    private Instant createdAt;

    public static TransactionDto fromEntity(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.id = transaction.getId();
        dto.userId = transaction.getUser() != null ? transaction.getUser().getId() : null;
        dto.userFullName = transaction.getUser() != null ? transaction.getUser().getFullName() : null;
        dto.courseTitle = transaction.getCourse() != null ? transaction.getCourse().getTitle() : null;
        dto.amount = transaction.getAmount();
        dto.status = transaction.getStatus() != null ? transaction.getStatus().name() : null;
        dto.method = transaction.getMethod() != null ? transaction.getMethod().name() : null;
        dto.provider = transaction.getProvider();
        dto.externalRef = transaction.getExternalRef();
        dto.gatewayResponseCode = transaction.getGatewayResponseCode();
        dto.paidAt = transaction.getPaidAt();
        dto.createdAt = transaction.getCreatedAt();
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }

    public String getMethod() {
        return method;
    }

    public String getProvider() {
        return provider;
    }

    public String getExternalRef() {
        return externalRef;
    }

    public String getGatewayResponseCode() {
        return gatewayResponseCode;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
