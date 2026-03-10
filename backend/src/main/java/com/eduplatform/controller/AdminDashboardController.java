package com.eduplatform.controller;

import com.eduplatform.service.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final RevenueService revenueService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> stats = revenueService.getStats();
        stats.put("revenueChart", revenueService.getRevenueChart());
        stats.put("recentTransactions", revenueService.getTransactions());
        return ResponseEntity.ok(stats);
    }
}
