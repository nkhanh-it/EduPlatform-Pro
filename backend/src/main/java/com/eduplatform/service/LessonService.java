package com.eduplatform.service;

import com.eduplatform.dto.LessonRequest;
import com.eduplatform.dto.LessonResponse;
import com.eduplatform.entity.*;
import com.eduplatform.exception.ResourceNotFoundException;
import com.eduplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CourseRepository courseRepository;

    public List<LessonResponse> getLessonsByCourseId(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Không tìm thấy khóa học với id: " + courseId);
        }
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        return lessons.stream().map(this::toResponse).toList();
    }

    public LessonResponse getLessonById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài học với id: " + id));
        return toResponse(lesson);
    }

    @Transactional
    public LessonResponse createLesson(Long courseId, LessonRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học với id: " + courseId));

        Lesson lesson = Lesson.builder()
                .course(course)
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex())
                .videoUrl(request.getVideoUrl())
                .durationMinutes(request.getDurationMinutes())
                .section(request.getSection())
                .build();

        lessonRepository.save(lesson);

        // Update totalLessons count on course
        long count = lessonRepository.countByCourseId(courseId);
        course.setTotalLessons((int) count);
        courseRepository.save(course);

        return toResponse(lesson);
    }

    @Transactional
    public LessonResponse updateLesson(Long id, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài học với id: " + id));

        if (request.getTitle() != null) lesson.setTitle(request.getTitle());
        if (request.getOrderIndex() != null) lesson.setOrderIndex(request.getOrderIndex());
        if (request.getVideoUrl() != null) lesson.setVideoUrl(request.getVideoUrl());
        if (request.getDurationMinutes() != null) lesson.setDurationMinutes(request.getDurationMinutes());
        if (request.getSection() != null) lesson.setSection(request.getSection());

        lessonRepository.save(lesson);
        return toResponse(lesson);
    }

    @Transactional
    public void deleteLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài học với id: " + id));

        Long courseId = lesson.getCourse().getId();
        lessonRepository.delete(lesson);

        // Update totalLessons count on course
        long count = lessonRepository.countByCourseId(courseId);
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course != null) {
            course.setTotalLessons((int) count);
            courseRepository.save(course);
        }
    }

    // === Student Progress ===

    public Map<String, Object> getCourseProgress(User user, Long courseId) {
        List<LessonProgress> progressList = lessonProgressRepository.findByUserIdAndLessonCourseId(user.getId(), courseId);
        long totalLessons = lessonRepository.countByCourseId(courseId);
        long completed = progressList.stream().filter(LessonProgress::getCompleted).count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalLessons", totalLessons);
        result.put("completedLessons", completed);
        result.put("progress", totalLessons > 0 ? (int) ((completed * 100) / totalLessons) : 0);
        result.put("lessons", progressList.stream().map(p -> Map.of(
                "lessonId", p.getLesson().getId(),
                "completed", p.getCompleted(),
                "completedAt", p.getCompletedAt() != null ? p.getCompletedAt().toString() : ""
        )).toList());

        return result;
    }

    @Transactional
    public void completeLesson(User user, Long lessonId) {
        var existing = lessonProgressRepository.findByUserIdAndLessonId(user.getId(), lessonId);

        if (existing.isPresent()) {
            LessonProgress progress = existing.get();
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            lessonProgressRepository.save(progress);
        } else {
            Lesson lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new ResourceNotFoundException("Bài học không tồn tại"));

            LessonProgress progress = LessonProgress.builder()
                    .user(user)
                    .lesson(lesson)
                    .completed(true)
                    .completedAt(LocalDateTime.now())
                    .build();
            lessonProgressRepository.save(progress);
        }
    }

    private LessonResponse toResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .courseId(lesson.getCourse().getId())
                .title(lesson.getTitle())
                .orderIndex(lesson.getOrderIndex())
                .videoUrl(lesson.getVideoUrl())
                .durationMinutes(lesson.getDurationMinutes())
                .section(lesson.getSection())
                .build();
    }
}
