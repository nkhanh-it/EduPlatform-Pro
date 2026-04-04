package com.example.app.dto;

import com.example.app.entity.Enrollment;
import com.example.app.entity.EnrollmentStatus;

import java.time.Instant;
import java.util.UUID;

public class EnrollmentDto {

    private UUID id;
    private UserDto user;
    private CourseDto course;
    private EnrollmentStatus status;
    private int progressPercent;
    private int completedLessons;
    private int totalLessons;
    private Instant enrolledAt;

    public static EnrollmentDto fromEntity(Enrollment enrollment) {
        EnrollmentDto dto = new EnrollmentDto();
        dto.id = enrollment.getId();
        dto.user = UserDto.fromEntity(enrollment.getUser());
        dto.course = CourseDto.fromEntity(enrollment.getCourse());
        dto.status = enrollment.getStatus();
        dto.progressPercent = enrollment.getProgressPercent();
        dto.completedLessons = enrollment.getCompletedLessons();
        dto.totalLessons = enrollment.getTotalLessons();
        dto.enrolledAt = enrollment.getEnrolledAt();
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public UserDto getUser() {
        return user;
    }

    public CourseDto getCourse() {
        return course;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public int getProgressPercent() {
        return progressPercent;
    }

    public int getCompletedLessons() {
        return completedLessons;
    }

    public int getTotalLessons() {
        return totalLessons;
    }

    public Instant getEnrolledAt() {
        return enrolledAt;
    }
}
