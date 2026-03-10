package com.eduplatform.repository;

import com.eduplatform.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserId(Long userId);
    List<Enrollment> findByCourseId(Long courseId);
    List<Enrollment> findByStatus(Enrollment.EnrollmentStatus status);
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    long countByUserId(Long userId);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
}
