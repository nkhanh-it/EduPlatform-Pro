package com.example.app.controller;

import com.example.app.dto.CheckoutRequest;
import com.example.app.dto.PaymentInitResponse;
import com.example.app.dto.RevenuePointDto;
import com.example.app.dto.RevenueSummaryDto;
import com.example.app.dto.TransactionDto;
import com.example.app.entity.Transaction;
import com.example.app.service.TransactionService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<PaymentInitResponse> checkout(@Valid @RequestBody CheckoutRequest request,
                                                        HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(transactionService.checkout(request, httpServletRequest.getRemoteAddr()));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<TransactionDto> getTransaction(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.getTransaction(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/transactions")
    public ResponseEntity<List<TransactionDto>> listTransactions() {
        return ResponseEntity.ok(transactionService.listAdminTransactions());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/revenue/summary")
    public ResponseEntity<RevenueSummaryDto> getRevenueSummary() {
        return ResponseEntity.ok(transactionService.getRevenueSummary());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/revenue/points")
    public ResponseEntity<List<RevenuePointDto>> getRevenuePoints() {
        return ResponseEntity.ok(transactionService.getRevenuePoints());
    }

    @GetMapping("/payments/vnpay/return")
    public RedirectView handleVnpayReturn(@RequestParam Map<String, String> params) {
        Transaction transaction;
        String status;
        try {
            transaction = transactionService.handleVnpayCallback(params);
            status = transaction.getStatus().name().equals("SUCCESS") ? "success" : "failed";
        } catch (Exception ex) {
            String transactionId = null;
            status = "failed";
            transaction = null;
            String txnRef = params.get("vnp_TxnRef");
            if (txnRef != null) {
                try {
                    transaction = transactionService.findByExternalRef(txnRef);
                    transactionId = transaction.getId().toString();
                } catch (Exception ignored) {
                    transactionId = null;
                }
            }
            String url = transactionService.buildFrontendReturnUrl(status, transactionId);
            return new RedirectView(url);
        }
        return new RedirectView(transactionService.buildFrontendReturnUrl(status, transaction.getId().toString()));
    }

    @GetMapping("/payments/vnpay/ipn")
    public ResponseEntity<Map<String, String>> handleVnpayIpn(@RequestParam Map<String, String> params) {
        try {
            transactionService.handleVnpayCallback(params);
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } catch (Exception ex) {
            if ("Invalid VNPAY signature".equals(ex.getMessage())) {
                return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid signature"));
            }
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", ex.getMessage()));
        }
    }
}
