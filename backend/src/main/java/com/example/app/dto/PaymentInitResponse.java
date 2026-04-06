package com.example.app.dto;

import java.util.UUID;

public class PaymentInitResponse {

    private UUID transactionId;
    private String status;
    private String paymentUrl;

    public PaymentInitResponse() {
    }

    public PaymentInitResponse(UUID transactionId, String status, String paymentUrl) {
        this.transactionId = transactionId;
        this.status = status;
        this.paymentUrl = paymentUrl;
    }

    public UUID getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(UUID transactionId) {
        this.transactionId = transactionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }
}
