package com.eduplatform.controller;

import com.eduplatform.dto.CourseResponse;
import com.eduplatform.dto.EnrollRequest;
import com.eduplatform.entity.User;
import com.eduplatform.service.EnrollmentService;
import com.eduplatform.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final EnrollmentService enrollmentService;
    private final LessonService lessonService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(enrollmentService.getStudentDashboard(user));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getEnrolledCourses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(enrollmentService.getEnrolledCourses(user));
    }

    @PostMapping("/enroll")
    public ResponseEntity<Map<String, Object>> enroll(@AuthenticationPrincipal User user,
                                                       @RequestBody EnrollRequest request) {
        Long enrollmentId = enrollmentService.enroll(user, request);
        return ResponseEntity.ok(Map.of(
                "message", "Đăng ký khóa học thành công!",
                "enrollmentId", enrollmentId
        ));
    }

    @GetMapping("/course/{courseId}/progress")
    public ResponseEntity<Map<String, Object>> getCourseProgress(@AuthenticationPrincipal User user,
                                                                   @PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getCourseProgress(user, courseId));
    }

    @PostMapping("/lesson/{lessonId}/complete")
    public ResponseEntity<Map<String, String>> completeLesson(@AuthenticationPrincipal User user,
                                                                @PathVariable Long lessonId) {
        lessonService.completeLesson(user, lessonId);
        return ResponseEntity.ok(Map.of("message", "Đã hoàn thành bài học"));
    }
}
