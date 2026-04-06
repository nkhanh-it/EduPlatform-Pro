package com.example.app.service;

import com.example.app.dto.EnrollmentCreateRequest;
import com.example.app.dto.EnrollmentDto;
import com.example.app.dto.EnrollmentProgressRequest;
import com.example.app.entity.Course;
import com.example.app.entity.Enrollment;
import com.example.app.entity.EnrollmentStatus;
import com.example.app.entity.Role;
import com.example.app.entity.User;
import com.example.app.exception.BadRequestException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.CourseRepository;
import com.example.app.repository.EnrollmentRepository;
import com.example.app.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserService userService;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             CourseRepository courseRepository,
                             UserService userService) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userService = userService;
    }

    public EnrollmentDto enroll(EnrollmentCreateRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new BadRequestException("Unauthenticated request");
        }

        User user = userService.getByEmail(email);
        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Enrollment existing = enrollmentRepository.findByUserIdAndCourseId(user.getId(), course.getId()).orElse(null);
        if (existing != null) {
            return EnrollmentDto.fromEntity(existing);
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.PENDING);
        enrollment.setTotalLessons(course.getTotalLessons());
        enrollmentRepository.save(enrollment);

        return EnrollmentDto.fromEntity(enrollment);
    }

    public List<EnrollmentDto> listMyEnrollments() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new BadRequestException("Unauthenticated request");
        }
        User user = userService.getByEmail(email);
        return enrollmentRepository.findByUserId(user.getId()).stream()
            .map(EnrollmentDto::fromEntity)
            .collect(Collectors.toList());
    }

    public List<EnrollmentDto> listRegistrations(EnrollmentStatus status) {
        List<Enrollment> enrollments = status == null
            ? enrollmentRepository.findAll()
            : enrollmentRepository.findByStatus(status);
        return enrollments.stream().map(EnrollmentDto::fromEntity).collect(Collectors.toList());
    }

    public EnrollmentDto approve(UUID enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        enrollment.setStatus(EnrollmentStatus.APPROVED);
        enrollmentRepository.save(enrollment);
        return EnrollmentDto.fromEntity(enrollment);
    }

    public EnrollmentDto reject(UUID enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        enrollment.setStatus(EnrollmentStatus.REJECTED);
        enrollmentRepository.save(enrollment);
        return EnrollmentDto.fromEntity(enrollment);
    }

    public EnrollmentDto updateProgress(UUID enrollmentId, EnrollmentProgressRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new BadRequestException("Unauthenticated request");
        }

        User currentUser = userService.getByEmail(email);
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        boolean isOwner = enrollment.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new BadRequestException("You are not allowed to update this enrollment");
        }

        int totalLessons = Math.max(0, request.getTotalLessons());
        int completedLessons = Math.max(0, Math.min(request.getCompletedLessons(), totalLessons));
        int progressPercent = totalLessons == 0
            ? 0
            : Math.max(0, Math.min(100, (int) Math.round((completedLessons * 100.0) / totalLessons)));

        enrollment.setProgressPercent(progressPercent);
        enrollment.setCompletedLessons(completedLessons);
        enrollment.setTotalLessons(totalLessons);
        enrollmentRepository.save(enrollment);
        return EnrollmentDto.fromEntity(enrollment);
    }
}
