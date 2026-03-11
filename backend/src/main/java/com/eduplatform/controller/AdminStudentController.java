package com.eduplatform.controller;

import com.eduplatform.dto.StudentPageResponse;
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
    public ResponseEntity<StudentPageResponse> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.getStudentsPaginated(search, status, startDate, endDate, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getStudentById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> createStudent(@RequestBody Map<String, String> request) {
        UserResponse response = userService.createStudent(
                request.get("name"),
                request.get("email"),
                request.getOrDefault("phone", ""),
                request.getOrDefault("password", "123456"));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateStudent(@PathVariable Long id, @RequestBody Map<String, String> request) {
        UserResponse response = userService.updateStudent(id,
                request.get("name"), request.get("email"), request.get("phone"));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteStudent(@PathVariable Long id) {
        userService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa học viên thành công"));
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<Map<String, String>> toggleLock(@PathVariable Long id) {
        String message = userService.toggleLock(id);
        String status = userService.getStatusString(id);
        return ResponseEntity.ok(Map.of("message", message, "status", status));
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<Map<String, String>> bulkDelete(@RequestBody Map<String, List<Long>> request) {
        List<Long> ids = request.get("ids");
        userService.bulkDelete(ids);
        return ResponseEntity.ok(Map.of("message", "Đã xóa " + ids.size() + " học viên"));
    }

    @PostMapping("/bulk-lock")
    public ResponseEntity<Map<String, String>> bulkLock(@RequestBody Map<String, List<Long>> request) {
        List<Long> ids = request.get("ids");
        userService.bulkLock(ids);
        return ResponseEntity.ok(Map.of("message", "Đã khóa " + ids.size() + " tài khoản"));
    }
}
