package com.eduplatform.controller;

import com.eduplatform.dto.LessonRequest;
import com.eduplatform.dto.LessonResponse;
import com.eduplatform.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    // === Public: Get lessons by course ===

    @GetMapping("/api/courses/{courseId}/lessons")
    public ResponseEntity<List<LessonResponse>> getLessonsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonService.getLessonsByCourseId(courseId));
    }

    @GetMapping("/api/lessons/{id}")
    public ResponseEntity<LessonResponse> getLesson(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getLessonById(id));
    }

    // === Admin: CRUD Lessons ===

    @PostMapping("/api/admin/courses/{courseId}/lessons")
    public ResponseEntity<LessonResponse> createLesson(@PathVariable Long courseId,
                                                        @RequestBody LessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lessonService.createLesson(courseId, request));
    }

    @PutMapping("/api/admin/lessons/{id}")
    public ResponseEntity<LessonResponse> updateLesson(@PathVariable Long id,
                                                        @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(id, request));
    }

    @DeleteMapping("/api/admin/lessons/{id}")
    public ResponseEntity<Map<String, String>> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa bài học thành công"));
    }
}
