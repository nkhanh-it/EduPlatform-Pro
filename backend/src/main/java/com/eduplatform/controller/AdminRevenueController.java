package com.eduplatform.controller;

import com.eduplatform.service.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/revenue")
@RequiredArgsConstructor
public class AdminRevenueController {

    private final RevenueService revenueService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(revenueService.getStats());
    }

    @GetMapping("/chart")
    public ResponseEntity<List<Map<String, Object>>> getRevenueChart() {
        return ResponseEntity.ok(revenueService.getRevenueChart());
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Map<String, Object>>> getTransactions() {
        return ResponseEntity.ok(revenueService.getTransactions());
    }
}
