package com.eduplatform.controller;

import com.eduplatform.dto.UserResponse;
import com.eduplatform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(userService.getAllStudents(search, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getStudentById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> createStudent(@RequestBody Map<String, String> request) {
        UserResponse response = userService.createStudent(
                request.get("name"), request.get("email"), request.getOrDefault("phone", ""));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateStudent(@PathVariable Long id, @RequestBody Map<String, String> request) {
        UserResponse response = userService.updateStudent(id,
                request.get("name"), request.get("email"), request.get("phone"));
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<Map<String, String>> toggleLock(@PathVariable Long id) {
        String message = userService.toggleLock(id);
        String status = userService.getStatusString(id);
        return ResponseEntity.ok(Map.of("message", message, "status", status));
    }
}
