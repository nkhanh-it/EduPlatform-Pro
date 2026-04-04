package com.example.app.controller;

import com.example.app.dto.EnrollmentCreateRequest;
import com.example.app.dto.EnrollmentDto;
import com.example.app.dto.EnrollmentProgressRequest;
import com.example.app.entity.EnrollmentStatus;
import com.example.app.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/enrollments")
    public ResponseEntity<EnrollmentDto> enroll(@Valid @RequestBody EnrollmentCreateRequest request) {
        return ResponseEntity.ok(enrollmentService.enroll(request));
    }

    @GetMapping("/enrollments/my")
    public ResponseEntity<List<EnrollmentDto>> myEnrollments() {
        return ResponseEntity.ok(enrollmentService.listMyEnrollments());
    }

    @PatchMapping("/enrollments/{id}/progress")
    public ResponseEntity<EnrollmentDto> updateProgress(@PathVariable UUID id,
                                                        @Valid @RequestBody EnrollmentProgressRequest request) {
        return ResponseEntity.ok(enrollmentService.updateProgress(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/registrations")
    public ResponseEntity<List<EnrollmentDto>> listRegistrations(@RequestParam(required = false) EnrollmentStatus status) {
        return ResponseEntity.ok(enrollmentService.listRegistrations(status));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/registrations/{id}/approve")
    public ResponseEntity<EnrollmentDto> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(enrollmentService.approve(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/registrations/{id}/reject")
    public ResponseEntity<EnrollmentDto> reject(@PathVariable UUID id) {
        return ResponseEntity.ok(enrollmentService.reject(id));
    }
}
