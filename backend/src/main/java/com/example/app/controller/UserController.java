package com.example.app.controller;

import com.example.app.dto.AdminCreateStudentRequest;
import com.example.app.dto.AdminUpdateStudentRequest;
import com.example.app.dto.ChangePasswordRequest;
import com.example.app.dto.UpdateProfileRequest;
import com.example.app.dto.UserDto;
import com.example.app.entity.UserStatus;
import com.example.app.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/students")
    public ResponseEntity<List<UserDto>> listStudents(@RequestParam(required = false) UserStatus status) {
        return ResponseEntity.ok(userService.listStudents(status));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/students")
    public ResponseEntity<UserDto> createStudent(@Valid @RequestBody AdminCreateStudentRequest request) {
        return ResponseEntity.ok(userService.createStudent(request.getFullName(), request.getEmail(), request.getPassword(), request.getPhone()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/students/{id}")
    public ResponseEntity<UserDto> updateStudent(@PathVariable UUID id,
                                                 @Valid @RequestBody AdminUpdateStudentRequest request) {
        return ResponseEntity.ok(userService.updateStudent(
            id,
            request.getFullName(),
            request.getEmail(),
            request.getPhone(),
            request.getPassword()
        ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/students/{id}/status")
    public ResponseEntity<UserDto> updateStudentStatus(@PathVariable UUID id, @RequestParam UserStatus status) {
        return ResponseEntity.ok(userService.updateStatus(id, status));
    }
}
