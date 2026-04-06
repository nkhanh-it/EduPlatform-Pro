package com.example.app.repository;

import com.example.app.entity.Enrollment;
import com.example.app.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByUserId(UUID userId);
    List<Enrollment> findByStatus(EnrollmentStatus status);
    Optional<Enrollment> findByUserIdAndCourseId(UUID userId, UUID courseId);
}
