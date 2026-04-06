package com.example.app.repository;

import com.example.app.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    List<Lesson> findByCourseIdOrderByOrderIndexAsc(UUID courseId);
    long countByCourseId(UUID courseId);
}
