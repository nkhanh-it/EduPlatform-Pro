package com.eduplatform.controller;

import com.eduplatform.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/enrollments")
@RequiredArgsConstructor
public class AdminEnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllEnrollments(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments(status));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Map<String, String>> approve(@PathVariable Long id) {
        enrollmentService.approveEnrollment(id);
        return ResponseEntity.ok(Map.of("message", "Đã duyệt đăng ký", "status", "completed"));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Map<String, String>> reject(@PathVariable Long id) {
        enrollmentService.rejectEnrollment(id);
        return ResponseEntity.ok(Map.of("message", "Đã từ chối đăng ký", "status", "rejected"));
    }
}
