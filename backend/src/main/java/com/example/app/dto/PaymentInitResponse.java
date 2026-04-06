package com.example.app.dto;

public class PaymentInitResponse {

    private String transactionId;
    private String status;
    private String paymentUrl;

    public PaymentInitResponse(String transactionId, String status, String paymentUrl) {
        this.transactionId = transactionId;
        this.status = status;
        this.paymentUrl = paymentUrl;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getStatus() {
        return status;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }
}
