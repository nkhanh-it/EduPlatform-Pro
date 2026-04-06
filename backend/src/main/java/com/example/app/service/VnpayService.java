package com.example.app.service;

import com.example.app.entity.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VnpayService {

    private static final DateTimeFormatter VNP_DATE_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VNP_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final boolean enabled;
    private final String tmnCode;
    private final String hashSecret;
    private final String paymentUrl;
    private final String returnUrl;

    public VnpayService(@Value("${app.payment.vnpay.enabled:false}") boolean enabled,
                        @Value("${app.payment.vnpay.tmn-code:}") String tmnCode,
                        @Value("${app.payment.vnpay.hash-secret:}") String hashSecret,
                        @Value("${app.payment.vnpay.payment-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}") String paymentUrl,
                        @Value("${app.payment.vnpay.return-url:http://localhost:8080/api/payments/vnpay/return}") String returnUrl) {
        this.enabled = enabled;
        this.tmnCode = tmnCode;
        this.hashSecret = hashSecret;
        this.paymentUrl = paymentUrl;
        this.returnUrl = returnUrl;
    }

    public String createPaymentUrl(Transaction transaction, String ipAddress) {
        if (!enabled || tmnCode.isBlank() || hashSecret.isBlank()) {
            throw new IllegalStateException("VNPAY is not configured");
        }

        LocalDateTime now = LocalDateTime.now(VNP_ZONE);
        LocalDateTime expiresAt = now.plusMinutes(15);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", transaction.getAmount().movePointRight(2).toBigInteger().toString());
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", transaction.getExternalRef());
        params.put("vnp_OrderInfo", "Thanh toan khoa hoc " + transaction.getCourse().getTitle());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", (ipAddress == null || ipAddress.isBlank()) ? "127.0.0.1" : ipAddress);
        params.put("vnp_CreateDate", VNP_DATE_TIME.format(now));
        params.put("vnp_ExpireDate", VNP_DATE_TIME.format(expiresAt));
        if (transaction.getMethod() == com.example.app.entity.PaymentMethod.QR) {
            params.put("vnp_BankCode", "VNPAYQR");
        }

        String query = buildQuery(params, true);
        String hashData = buildQuery(params, true);
        String secureHash = hmacSha512(hashSecret, hashData);
        return paymentUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifyCallback(Map<String, String> params) {
        String providedHash = params.get("vnp_SecureHash");
        if (providedHash == null || providedHash.isBlank()) {
            return false;
        }

        Map<String, String> filtered = new HashMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");
        String hashData = buildQuery(filtered, true);
        String calculated = hmacSha512(hashSecret, hashData);
        return calculated.equalsIgnoreCase(providedHash);
    }

    private String buildQuery(Map<String, String> params, boolean encodeValues) {
        List<Map.Entry<String, String>> entries = new ArrayList<>(params.entrySet());
        entries.removeIf(entry -> entry.getValue() == null || entry.getValue().isBlank());
        entries.sort(Comparator.comparing(Map.Entry::getKey));

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < entries.size(); i++) {
            Map.Entry<String, String> entry = entries.get(i);
            if (i > 0) {
                sb.append('&');
            }
            sb.append(encode(entry.getKey()));
            sb.append('=');
            sb.append(encodeValues ? encode(entry.getValue()) : entry.getValue());
        }
        return sb.toString();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKeySpec);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot sign VNPAY payload", ex);
        }
    }
}
