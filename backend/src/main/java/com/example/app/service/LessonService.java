package com.example.app.service;

import com.example.app.dto.LessonCreateRequest;
import com.example.app.dto.LessonDto;
import com.example.app.dto.LessonUpdateRequest;
import com.example.app.entity.Course;
import com.example.app.entity.Lesson;
import com.example.app.entity.EnrollmentStatus;
import com.example.app.entity.Role;
import com.example.app.entity.User;
import com.example.app.exception.BadRequestException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.EnrollmentRepository;
import com.example.app.repository.LessonRepository;
import com.example.app.repository.UserRepository;
import com.example.app.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseService courseService;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public LessonService(LessonRepository lessonRepository,
                         CourseService courseService,
                         UserRepository userRepository,
                         EnrollmentRepository enrollmentRepository) {
        this.lessonRepository = lessonRepository;
        this.courseService = courseService;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public List<LessonDto> listByCourse(UUID courseId) {
        boolean canAccessVideo = canAccessVideo(courseId);
        return lessonRepository.findByCourseIdOrderByOrderIndexAsc(courseId).stream()
            .map(lesson -> LessonDto.fromEntity(lesson, canAccessVideo || lesson.isPreview()))
            .collect(Collectors.toList());
    }

    public Lesson getLesson(UUID lessonId) {
        return lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
    }

    public LessonDto createLesson(UUID courseId, LessonCreateRequest request) {
        Course course = courseService.getCourseEntity(courseId);
        Lesson lesson = new Lesson();
        lesson.setCourse(course);
        lesson.setTitle(request.getTitle().trim());
        lesson.setOrderIndex(request.getOrderIndex());
        lesson.setDurationSeconds(request.getDurationSeconds());
        lesson.setPreview(request.isPreview());
        applyPlaybackUrl(lesson, request.getGumletPlaybackUrl());
        Lesson saved = lessonRepository.save(lesson);
        syncCourseLessonCount(course);
        return LessonDto.fromEntity(saved);
    }

    public LessonDto updateLesson(UUID lessonId, LessonUpdateRequest request) {
        Lesson lesson = getLesson(lessonId);
        if (request.getTitle() != null) {
            lesson.setTitle(request.getTitle().trim());
        }
        if (request.getOrderIndex() != null) {
            lesson.setOrderIndex(request.getOrderIndex());
        }
        if (request.getDurationSeconds() != null) {
            lesson.setDurationSeconds(request.getDurationSeconds());
        }
        if (request.getPreview() != null) {
            lesson.setPreview(request.getPreview());
        }
        if (request.getGumletPlaybackUrl() != null) {
            applyPlaybackUrl(lesson, request.getGumletPlaybackUrl());
        }
        Lesson saved = lessonRepository.save(lesson);
        syncCourseLessonCount(lesson.getCourse());
        return LessonDto.fromEntity(saved);
    }

    public void deleteLesson(UUID lessonId) {
        Lesson lesson = getLesson(lessonId);
        Course course = lesson.getCourse();
        lessonRepository.delete(lesson);
        syncCourseLessonCount(course);
    }

    private void applyPlaybackUrl(Lesson lesson, String rawPlaybackUrl) {
        String normalized = normalize(rawPlaybackUrl);
        if (normalized == null) {
            lesson.setGumletPlaybackUrl(null);
            return;
        }

        if (!looksLikeUrl(normalized)) {
            throw new BadRequestException("Playback link is invalid");
        }

        lesson.setGumletPlaybackUrl(normalized);
    }

    private void syncCourseLessonCount(Course course) {
        course.setTotalLessons((int) lessonRepository.countByCourseId(course.getId()));
        courseService.saveCourse(course);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private boolean looksLikeUrl(String value) {
        return value.startsWith("http://") || value.startsWith("https://");
    }

    private boolean canAccessVideo(UUID courseId) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            return false;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return false;
        }

        if (user.getRole() == Role.ADMIN) {
            return true;
        }

        return enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
            .map(enrollment -> enrollment.getStatus() == EnrollmentStatus.APPROVED)
            .orElse(false);
    }
}
