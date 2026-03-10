package com.eduplatform.service;

import com.eduplatform.dto.CourseRequest;
import com.eduplatform.dto.CourseResponse;
import com.eduplatform.entity.Course;
import com.eduplatform.exception.ResourceNotFoundException;
import com.eduplatform.repository.CourseRepository;
import com.eduplatform.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    public List<CourseResponse> getAllCourses(String category, String search) {
        List<Course> courses;

        if (search != null && !search.isBlank()) {
            courses = courseRepository.findByTitleContainingIgnoreCaseOrInstructorContainingIgnoreCase(search, search);
        } else if (category != null && !category.isBlank() && !category.equals("All")) {
            courses = courseRepository.findByCategory(category);
        } else {
            courses = courseRepository.findAll();
        }

        return courses.stream().map(this::toResponse).toList();
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học với id: " + id));
        return toResponse(course);
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        Course course = Course.builder()
                .title(request.getTitle())
                .instructor(request.getInstructor())
                .thumbnail(request.getThumbnail())
                .category(request.getCategory())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .totalLessons(request.getTotalLessons())
                .description(request.getDescription())
                .status(request.getStatus() != null ? Course.CourseStatus.valueOf(request.getStatus()) : Course.CourseStatus.PUBLIC)
                .build();

        courseRepository.save(course);
        return toResponse(course);
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học với id: " + id));

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getInstructor() != null) course.setInstructor(request.getInstructor());
        if (request.getThumbnail() != null) course.setThumbnail(request.getThumbnail());
        if (request.getCategory() != null) course.setCategory(request.getCategory());
        if (request.getPrice() != null) course.setPrice(request.getPrice());
        if (request.getOriginalPrice() != null) course.setOriginalPrice(request.getOriginalPrice());
        if (request.getTotalLessons() != null) course.setTotalLessons(request.getTotalLessons());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getStatus() != null) course.setStatus(Course.CourseStatus.valueOf(request.getStatus()));

        courseRepository.save(course);
        return toResponse(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy khóa học với id: " + id);
        }
        courseRepository.deleteById(id);
    }

    public CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .instructor(course.getInstructor())
                .thumbnail(course.getThumbnail())
                .category(course.getCategory())
                .rating(course.getRating())
                .reviews(course.getReviews())
                .price(course.getPrice())
                .originalPrice(course.getOriginalPrice())
                .totalLessons(course.getTotalLessons())
                .status(course.getStatus().name().toLowerCase())
                .build();
    }
}
