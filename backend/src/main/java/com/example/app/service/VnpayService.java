package com.example.app.service;

import com.example.app.entity.PaymentStatus;
import com.example.app.entity.Transaction;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class VnpayService {

    private final String frontendBaseUrl;

    public VnpayService() {
        String configured = System.getenv("FRONTEND_BASE_URL");
        this.frontendBaseUrl = configured != null && !configured.isBlank()
            ? configured
            : "http://localhost:5173";
    }

    public String createPaymentUrl(Transaction transaction) {
        return buildFrontendReturnUrl(transaction, PaymentStatus.SUCCESS);
    }

    public String buildFrontendReturnUrl(Transaction transaction, PaymentStatus status) {
        String paymentStatus = status == PaymentStatus.SUCCESS ? "success" : "failed";
        return UriComponentsBuilder.fromHttpUrl(frontendBaseUrl)
            .queryParam("paymentStatus", paymentStatus)
            .queryParam("transactionId", transaction.getId())
            .build()
            .toUriString();
    }

    public PaymentStatus resolveStatus(Map<String, String> params) {
        String responseCode = params.get("vnp_ResponseCode");
        String paymentStatus = params.get("paymentStatus");
        if ("00".equals(responseCode) || "success".equalsIgnoreCase(paymentStatus)) {
            return PaymentStatus.SUCCESS;
        }
        return PaymentStatus.FAILED;
    }

    public String resolveGatewayResponseCode(Map<String, String> params) {
        return params.getOrDefault("vnp_ResponseCode", params.getOrDefault("paymentStatus", "UNKNOWN"));
    }

    public Map<String, String> buildIpnResponse(PaymentStatus status) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("RspCode", "00");
        body.put("Message", status == PaymentStatus.SUCCESS ? "Confirm Success" : "Confirm Failed");
        return body;
    }
}
