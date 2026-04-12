package com.example.app.service;

import com.example.app.dto.LessonCreateRequest;
import com.example.app.dto.LessonDto;
import com.example.app.dto.LessonUpdateRequest;
import com.example.app.entity.Course;
import com.example.app.entity.Lesson;
import com.example.app.entity.MediaFile;
import com.example.app.entity.EnrollmentStatus;
import com.example.app.entity.Role;
import com.example.app.entity.User;
import com.example.app.exception.BadRequestException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.EnrollmentRepository;
import com.example.app.repository.LessonRepository;
import com.example.app.repository.MediaFileRepository;
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
    private final MediaFileRepository mediaFileRepository;
    private final MediaService mediaService;

    public LessonService(LessonRepository lessonRepository,
                         CourseService courseService,
                         UserRepository userRepository,
                         EnrollmentRepository enrollmentRepository,
                         MediaFileRepository mediaFileRepository,
                         MediaService mediaService) {
        this.lessonRepository = lessonRepository;
        this.courseService = courseService;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.mediaFileRepository = mediaFileRepository;
        this.mediaService = mediaService;
    }

    public List<LessonDto> listByCourse(UUID courseId) {
        Course course = courseService.getCourseEntity(courseId);
        boolean canAccessVideo = canAccessVideo(course.getId());
        return lessonRepository.findByCourseIdOrderByOrderIndexAsc(course.getId()).stream()
            .map(lesson -> LessonDto.fromEntity(
                lesson,
                buildPlaybackUrl(lesson, canAccessVideo || lesson.isPreview())
            ))
            .collect(Collectors.toList());
    }

    public Lesson getLesson(UUID lessonId) {
        return lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
    }

    public LessonDto createLesson(UUID courseId, LessonCreateRequest request) {
        Course course = courseService.getCourseEntity(courseId);
        validateUniqueOrderIndex(course.getId(), request.getOrderIndex(), null);
        Lesson lesson = new Lesson();
        lesson.setCourse(course);
        lesson.setTitle(normalizeTitle(request.getTitle()));
        lesson.setOrderIndex(request.getOrderIndex());
        lesson.setDurationSeconds(request.getDurationSeconds());
        lesson.setPreview(request.isPreview());
        lesson.setMediaFile(resolveMediaFile(request.getMediaFileId()));
        Lesson saved = lessonRepository.save(lesson);
        syncCourseLessonCount(course);
        return LessonDto.fromEntity(saved, buildPlaybackUrl(saved, true));
    }

    public LessonDto updateLesson(UUID lessonId, LessonUpdateRequest request) {
        Lesson lesson = getLesson(lessonId);
        MediaFile previousMediaFile = lesson.getMediaFile();
        if (request.getTitle() != null) {
            lesson.setTitle(normalizeTitle(request.getTitle()));
        }
        if (request.getOrderIndex() != null) {
            validateUniqueOrderIndex(lesson.getCourse().getId(), request.getOrderIndex(), lesson.getId());
            lesson.setOrderIndex(request.getOrderIndex());
        }
        if (request.getDurationSeconds() != null) {
            lesson.setDurationSeconds(request.getDurationSeconds());
        }
        if (request.getPreview() != null) {
            lesson.setPreview(request.getPreview());
        }
        if (Boolean.TRUE.equals(request.getClearMedia())) {
            lesson.setMediaFile(null);
        } else if (request.getMediaFileId() != null) {
            lesson.setMediaFile(resolveMediaFile(request.getMediaFileId()));
        }
        Lesson saved = lessonRepository.save(lesson);
        cleanupUnusedMedia(previousMediaFile, saved.getMediaFile());
        syncCourseLessonCount(lesson.getCourse());
        return LessonDto.fromEntity(saved, buildPlaybackUrl(saved, true));
    }

    public void deleteLesson(UUID lessonId) {
        Lesson lesson = getLesson(lessonId);
        Course course = lesson.getCourse();
        MediaFile previousMediaFile = lesson.getMediaFile();
        lessonRepository.delete(lesson);
        cleanupUnusedMedia(previousMediaFile, null);
        syncCourseLessonCount(course);
    }

    private MediaFile resolveMediaFile(UUID mediaFileId) {
        if (mediaFileId == null) {
            return null;
        }
        return mediaFileRepository.findById(mediaFileId)
            .orElseThrow(() -> new BadRequestException("Media file does not exist"));
    }

    private void validateUniqueOrderIndex(UUID courseId, int orderIndex, UUID lessonId) {
        boolean exists = lessonId == null
            ? lessonRepository.existsByCourseIdAndOrderIndex(courseId, orderIndex)
            : lessonRepository.existsByCourseIdAndOrderIndexAndIdNot(courseId, orderIndex, lessonId);
        if (exists) {
            throw new BadRequestException("Lesson order already exists in this course");
        }
    }

    private String normalizeTitle(String title) {
        String normalized = title == null ? null : title.trim();
        if (normalized == null || normalized.isBlank()) {
            throw new BadRequestException("Lesson title is required");
        }
        return normalized;
    }

    private void syncCourseLessonCount(Course course) {
        course.setTotalLessons((int) lessonRepository.countByCourseId(course.getId()));
        courseService.saveCourse(course);
    }

    private void cleanupUnusedMedia(MediaFile previousMediaFile, MediaFile currentMediaFile) {
        if (previousMediaFile == null) {
            return;
        }
        if (currentMediaFile != null && previousMediaFile.getId().equals(currentMediaFile.getId())) {
            return;
        }
        if (lessonRepository.countByMediaFileId(previousMediaFile.getId()) > 0) {
            return;
        }
        mediaService.deleteMediaFileAssets(previousMediaFile.getId());
    }

    private String buildPlaybackUrl(Lesson lesson, boolean includeVideo) {
        if (!includeVideo || lesson.getMediaFile() == null) {
            return null;
        }
        return mediaService.createPlaybackUrl(
            lesson.getMediaFile(),
            lesson.getId(),
            lesson.isPreview(),
            lesson.isPreview() ? null : SecurityUtils.getCurrentUserEmail()
        );
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

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.INSTRUCTOR) {
            return true;
        }

        return enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
            .map(enrollment -> enrollment.getStatus() == EnrollmentStatus.APPROVED)
            .orElse(false);
    }
}
