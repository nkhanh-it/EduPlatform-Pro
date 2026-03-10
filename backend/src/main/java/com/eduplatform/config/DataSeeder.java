package com.eduplatform.config;

import com.eduplatform.entity.*;
import com.eduplatform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping...");
            return;
        }

        log.info("Seeding database...");

        // === USERS ===
        User admin = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@eduplatform.com")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .status(User.Status.ACTIVE)
                .avatar("https://picsum.photos/seed/admin/100/100")
                .joinDate(LocalDate.of(2023, 1, 1))
                .build());

        User student1 = userRepository.save(User.builder()
                .name("Nguyễn Văn A")
                .email("nguyenvana@email.com")
                .password(passwordEncoder.encode("123456"))
                .phone("0912 345 678")
                .role(User.Role.STUDENT)
                .status(User.Status.ACTIVE)
                .avatar("https://picsum.photos/seed/user1/100/100")
                .joinDate(LocalDate.of(2023, 5, 12))
                .build());

        User student2 = userRepository.save(User.builder()
                .name("Trần Thị B")
                .email("tranthib@email.com")
                .password(passwordEncoder.encode("123456"))
                .phone("0987 654 321")
                .role(User.Role.STUDENT)
                .status(User.Status.ACTIVE)
                .avatar("https://picsum.photos/seed/user2/100/100")
                .joinDate(LocalDate.of(2023, 6, 15))
                .build());

        User student3 = userRepository.save(User.builder()
                .name("Lê Văn C")
                .email("levanc@email.com")
                .password(passwordEncoder.encode("123456"))
                .phone("0911 222 333")
                .role(User.Role.STUDENT)
                .status(User.Status.LOCKED)
                .avatar("https://picsum.photos/seed/user3/100/100")
                .joinDate(LocalDate.of(2023, 8, 20))
                .build());

        User student4 = userRepository.save(User.builder()
                .name("Phạm Thị D")
                .email("phamthid@email.com")
                .password(passwordEncoder.encode("123456"))
                .phone("0999 888 777")
                .role(User.Role.STUDENT)
                .status(User.Status.ACTIVE)
                .avatar("https://picsum.photos/seed/user4/100/100")
                .joinDate(LocalDate.of(2023, 9, 1))
                .build());

        User student5 = userRepository.save(User.builder()
                .name("Hoàng Văn E")
                .email("hoangvane@email.com")
                .password(passwordEncoder.encode("123456"))
                .phone("0944 555 666")
                .role(User.Role.STUDENT)
                .status(User.Status.PENDING)
                .avatar("https://picsum.photos/seed/user5/100/100")
                .joinDate(LocalDate.of(2023, 10, 10))
                .build());

        // === COURSES ===
        Course course1 = courseRepository.save(Course.builder()
                .title("ReactJS Toàn tập: Từ cơ bản đến nâng cao")
                .instructor("Nguyễn Văn A")
                .thumbnail("https://picsum.photos/seed/react/800/450")
                .category("Web Dev")
                .rating(4.8)
                .reviews(1234)
                .price(500000L)
                .originalPrice(1000000L)
                .totalLessons(34)
                .status(Course.CourseStatus.PUBLIC)
                .build());

        Course course2 = courseRepository.save(Course.builder()
                .title("Python cho Data Science & Machine Learning")
                .instructor("Lê Thị B")
                .thumbnail("https://picsum.photos/seed/python/800/450")
                .category("Data Science")
                .rating(4.9)
                .reviews(850)
                .price(600000L)
                .originalPrice(1200000L)
                .totalLessons(50)
                .status(Course.CourseStatus.PUBLIC)
                .build());

        Course course3 = courseRepository.save(Course.builder()
                .title("Digital Marketing 101: Chiến lược toàn diện")
                .instructor("Trần Văn C")
                .thumbnail("https://picsum.photos/seed/marketing/800/450")
                .category("Business")
                .rating(4.5)
                .reviews(2100)
                .price(300000L)
                .originalPrice(800000L)
                .totalLessons(24)
                .status(Course.CourseStatus.PUBLIC)
                .build());

        Course course4 = courseRepository.save(Course.builder()
                .title("Thiết kế UX/UI cơ bản cho người mới bắt đầu")
                .instructor("Phạm Thị D")
                .thumbnail("https://picsum.photos/seed/design/800/450")
                .category("Design")
                .rating(4.7)
                .reviews(560)
                .price(450000L)
                .originalPrice(900000L)
                .totalLessons(25)
                .status(Course.CourseStatus.PUBLIC)
                .build());

        // === LESSONS for Course 1 ===
        String[] lessonTitles = {
                "Giới thiệu ReactJS", "Cài đặt môi trường", "JSX là gì?",
                "Components cơ bản", "Props và State", "Event Handling",
                "Conditional Rendering", "Lists và Keys", "Forms trong React",
                "useEffect Hook"
        };
        for (int i = 0; i < lessonTitles.length; i++) {
            lessonRepository.save(Lesson.builder()
                    .course(course1)
                    .title(lessonTitles[i])
                    .orderIndex(i + 1)
                    .durationMinutes(15 + (i * 5))
                    .section(i < 3 ? "Giới thiệu" : i < 6 ? "Cơ bản" : "Nâng cao")
                    .build());
        }

        // === ENROLLMENTS ===
        enrollmentRepository.save(Enrollment.builder()
                .user(student1).course(course1)
                .status(Enrollment.EnrollmentStatus.COMPLETED)
                .completedLessons(12)
                .enrollDate(LocalDate.of(2023, 6, 1))
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .user(student1).course(course2)
                .status(Enrollment.EnrollmentStatus.COMPLETED)
                .completedLessons(5)
                .enrollDate(LocalDate.of(2023, 7, 1))
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .user(student2).course(course1)
                .status(Enrollment.EnrollmentStatus.COMPLETED)
                .completedLessons(3)
                .enrollDate(LocalDate.of(2023, 7, 15))
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .user(student4).course(course3)
                .status(Enrollment.EnrollmentStatus.PENDING)
                .enrollDate(LocalDate.of(2023, 10, 24))
                .build());

        log.info("Database seeded successfully!");
        log.info("Admin: admin@eduplatform.com / admin123");
        log.info("Student: nguyenvana@email.com / 123456");
    }
}
