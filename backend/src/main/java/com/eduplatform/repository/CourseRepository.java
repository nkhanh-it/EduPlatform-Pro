package com.eduplatform.repository;

import com.eduplatform.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCategory(String category);
    List<Course> findByStatus(Course.CourseStatus status);
    List<Course> findByTitleContainingIgnoreCaseOrInstructorContainingIgnoreCase(String title, String instructor);
}
