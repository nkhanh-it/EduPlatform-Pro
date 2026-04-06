package com.example.app.controller;

import com.example.app.dto.CheckoutRequest;
import com.example.app.dto.PaymentInitResponse;
import com.example.app.dto.RevenuePointDto;
import com.example.app.dto.RevenueSummaryDto;
import com.example.app.dto.TransactionDto;
import com.example.app.service.TransactionService;
import jakarta.validation.Valid;
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
    public ResponseEntity<PaymentInitResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(transactionService.checkout(request));
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
    public ResponseEntity<RevenueSummaryDto> revenueSummary() {
        return ResponseEntity.ok(transactionService.getRevenueSummary());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/revenue/points")
    public ResponseEntity<List<RevenuePointDto>> revenuePoints() {
        return ResponseEntity.ok(transactionService.getRevenuePoints());
    }

    @GetMapping("/payments/vnpay/return")
    public RedirectView vnpayReturn(@RequestParam Map<String, String> params) {
        return new RedirectView(transactionService.handleVnpayReturn(params));
    }

    @GetMapping("/payments/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(transactionService.handleVnpayIpn(params));
    }
}
