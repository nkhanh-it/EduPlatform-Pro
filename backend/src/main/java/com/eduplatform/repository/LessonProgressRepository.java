package com.eduplatform.repository;

import com.eduplatform.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByUserId(Long userId);
    List<LessonProgress> findByUserIdAndLessonCourseId(Long userId, Long courseId);
    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    long countByUserIdAndCompletedTrue(Long userId);
    long countByUserIdAndLessonCourseIdAndCompletedTrue(Long userId, Long courseId);
}
