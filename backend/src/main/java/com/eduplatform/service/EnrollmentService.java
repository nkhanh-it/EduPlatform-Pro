package com.eduplatform.service;

import com.eduplatform.dto.CourseResponse;
import com.eduplatform.dto.EnrollRequest;
import com.eduplatform.entity.*;
import com.eduplatform.exception.BadRequestException;
import com.eduplatform.exception.ResourceNotFoundException;
import com.eduplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TransactionRepository transactionRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public Map<String, Object> getStudentDashboard(User user) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());
        long completedLessons = lessonProgressRepository.countByUserIdAndCompletedTrue(user.getId());

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("enrolledCourses", enrollments.size());
        dashboard.put("completedLessons", completedLessons);
        dashboard.put("totalHoursLearned", completedLessons * 0.5);
        dashboard.put("certificates", 0);

        List<Map<String, Object>> courses = enrollments.stream()
                .filter(e -> e.getStatus() == Enrollment.EnrollmentStatus.COMPLETED)
                .map(e -> {
                    Course course = e.getCourse();
                    long total = lessonRepository.countByCourseId(course.getId());
                    long completed = lessonProgressRepository.countByUserIdAndLessonCourseIdAndCompletedTrue(user.getId(), course.getId());
                    int progress = total > 0 ? (int) ((completed * 100) / total) : 0;

                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", course.getId());
                    map.put("title", course.getTitle());
                    map.put("instructor", course.getInstructor());
                    map.put("thumbnail", course.getThumbnail());
                    map.put("progress", progress);
                    map.put("totalLessons", total);
                    map.put("completedLessons", completed);
                    return map;
                }).toList();

        dashboard.put("courses", courses);
        return dashboard;
    }

    public List<CourseResponse> getEnrolledCourses(User user) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());

        return enrollments.stream()
                .filter(e -> e.getStatus() == Enrollment.EnrollmentStatus.COMPLETED)
                .map(e -> {
                    Course course = e.getCourse();
                    long total = lessonRepository.countByCourseId(course.getId());
                    long completed = lessonProgressRepository.countByUserIdAndLessonCourseIdAndCompletedTrue(user.getId(), course.getId());
                    int progress = total > 0 ? (int) ((completed * 100) / total) : 0;

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
                            .totalLessons((int) total)
                            .completedLessons((int) completed)
                            .progress(progress)
                            .status(course.getStatus().name().toLowerCase())
                            .build();
                }).toList();
    }

    @Transactional
    public Long enroll(User user, EnrollRequest request) {
        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), request.getCourseId())) {
            throw new BadRequestException("Bạn đã đăng ký khóa học này rồi");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học không tồn tại"));

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .status(Enrollment.EnrollmentStatus.PENDING)
                .build();
        enrollmentRepository.save(enrollment);

        Transaction transaction = Transaction.builder()
                .user(user)
                .course(course)
                .amount(course.getPrice())
                .paymentMethod(request.getPaymentMethod())
                .status(Transaction.TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(transaction);

        enrollment.setStatus(Enrollment.EnrollmentStatus.COMPLETED);
        enrollmentRepository.save(enrollment);

        return enrollment.getId();
    }

    // === Admin: Enrollment Management ===

    public List<Map<String, Object>> getAllEnrollments(String status) {
        List<Enrollment> enrollments;
        if (status != null && !status.isBlank()) {
            enrollments = enrollmentRepository.findByStatus(Enrollment.EnrollmentStatus.valueOf(status.toUpperCase()));
        } else {
            enrollments = enrollmentRepository.findAll();
        }

        return enrollments.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("student", Map.of(
                    "id", e.getUser().getId(),
                    "name", e.getUser().getName(),
                    "email", e.getUser().getEmail(),
                    "avatar", e.getUser().getAvatar() != null ? e.getUser().getAvatar() : ""
            ));
            map.put("course", Map.of(
                    "id", e.getCourse().getId(),
                    "title", e.getCourse().getTitle(),
                    "price", e.getCourse().getPrice()
            ));
            map.put("date", e.getEnrollDate() != null ? e.getEnrollDate().format(FORMATTER) : "");
            map.put("status", e.getStatus().name().toLowerCase());
            map.put("amount", e.getCourse().getPrice());
            return map;
        }).toList();
    }

    @Transactional
    public void approveEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đăng ký với id: " + id));
        enrollment.setStatus(Enrollment.EnrollmentStatus.COMPLETED);
        enrollmentRepository.save(enrollment);
    }

    @Transactional
    public void rejectEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đăng ký với id: " + id));
        enrollment.setStatus(Enrollment.EnrollmentStatus.REJECTED);
        enrollmentRepository.save(enrollment);
    }
}
