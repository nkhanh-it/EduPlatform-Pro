package com.example.app.service;

import com.example.app.dto.CourseCreateRequest;
import com.example.app.dto.CourseDto;
import com.example.app.dto.CourseUpdateRequest;
import com.example.app.entity.Category;
import com.example.app.entity.Course;
import com.example.app.exception.BadRequestException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.CategoryRepository;
import com.example.app.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;

    public CourseService(CourseRepository courseRepository, CategoryRepository categoryRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<CourseDto> listCourses(String category, String search) {
        return filterCourses(courseRepository.findAll(), category, search, Boolean.TRUE);
    }

    public List<CourseDto> listAdminCourses(String category, String search, Boolean published) {
        return filterCourses(courseRepository.findAll(), category, search, published);
    }

    private List<CourseDto> filterCourses(List<Course> courses, String category, String search, Boolean published) {
        return courses.stream()
            .filter(course -> published == null || course.isPublished() == published)
            .filter(course -> category == null || category.equalsIgnoreCase("All") ||
                (course.getCategory() != null && course.getCategory().getName().equalsIgnoreCase(category)))
            .filter(course -> search == null || search.isBlank() ||
                course.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                course.getInstructorName().toLowerCase().contains(search.toLowerCase()))
            .map(CourseDto::fromEntity)
            .collect(Collectors.toList());
    }

    public CourseDto getCourse(UUID id) {
        return CourseDto.fromEntity(getCourseEntity(id));
    }

    public Course getCourseEntity(UUID id) {
        return courseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    public void saveCourse(Course course) {
        courseRepository.save(course);
    }

    public CourseDto createCourse(CourseCreateRequest request) {
        validatePrices(request.getPrice(), request.getOriginalPrice());

        Course course = new Course();
        course.setTitle(request.getTitle().trim());
        course.setDescription(normalizeText(request.getDescription()));
        course.setInstructorName(request.getInstructorName().trim());
        course.setThumbnailUrl(normalizeText(request.getThumbnailUrl()));
        course.setPrice(request.getPrice());
        course.setOriginalPrice(request.getOriginalPrice());
        course.setTotalLessons(request.getTotalLessons());

        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            course.setCategory(resolveCategory(request.getCategory()));
        }

        courseRepository.save(course);
        return CourseDto.fromEntity(course);
    }

    public CourseDto updateCourse(UUID id, CourseUpdateRequest request) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        validatePrices(request.getPrice(), request.getOriginalPrice());

        if (request.getTitle() != null) {
            course.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            course.setDescription(normalizeText(request.getDescription()));
        }
        if (request.getInstructorName() != null) {
            course.setInstructorName(request.getInstructorName().trim());
        }
        if (request.getThumbnailUrl() != null) {
            course.setThumbnailUrl(normalizeText(request.getThumbnailUrl()));
        }
        if (request.getPrice() != null) {
            course.setPrice(request.getPrice());
        }
        if (request.getOriginalPrice() != null) {
            course.setOriginalPrice(request.getOriginalPrice());
        }
        if (request.getTotalLessons() != null) {
            course.setTotalLessons(request.getTotalLessons());
        }
        if (request.getPublished() != null) {
            course.setPublished(request.getPublished());
        }
        if (request.getCategory() != null) {
            course.setCategory(resolveCategory(request.getCategory()));
        }

        courseRepository.save(course);
        return CourseDto.fromEntity(course);
    }

    public void deleteCourse(UUID id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found");
        }
        courseRepository.deleteById(id);
    }

    private Category resolveCategory(String name) {
        String trimmed = name.trim();
        return categoryRepository.findByName(trimmed)
            .orElseGet(() -> {
                Category category = new Category();
                category.setName(trimmed);
                category.setSlug(trimmed.toLowerCase().replace(" ", "-"));
                return categoryRepository.save(category);
            });
    }

    private void validatePrices(java.math.BigDecimal price, java.math.BigDecimal originalPrice) {
        if (price != null && originalPrice != null && originalPrice.compareTo(price) < 0) {
            throw new BadRequestException("Original price must be greater than or equal to price");
        }
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
