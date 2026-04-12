package com.example.app.controller;

import com.example.app.dto.LessonCreateRequest;
import com.example.app.dto.LessonDto;
import com.example.app.dto.LessonUpdateRequest;
import com.example.app.service.LessonService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping("/courses/{courseId}/lessons")
    public ResponseEntity<List<LessonDto>> listLessons(@PathVariable UUID courseId) {
        return ResponseEntity.ok(lessonService.listByCourse(courseId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @GetMapping("/admin/courses/{courseId}/lessons")
    public ResponseEntity<List<LessonDto>> listAdminLessons(@PathVariable UUID courseId) {
        return ResponseEntity.ok(lessonService.listByCourse(courseId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @PostMapping("/courses/{courseId}/lessons")
    public ResponseEntity<LessonDto> createLesson(@PathVariable UUID courseId,
                                                  @Valid @RequestBody LessonCreateRequest request) {
        return ResponseEntity.ok(lessonService.createLesson(courseId, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonDto> updateLesson(@PathVariable UUID lessonId,
                                                  @Valid @RequestBody LessonUpdateRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(lessonId, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(@PathVariable UUID lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.noContent().build();
    }
}
