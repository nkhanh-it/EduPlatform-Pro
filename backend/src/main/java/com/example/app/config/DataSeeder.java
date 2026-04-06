package com.example.app.config;

import com.example.app.entity.Category;
import com.example.app.entity.Course;
import com.example.app.entity.Enrollment;
import com.example.app.entity.EnrollmentStatus;
import com.example.app.entity.PaymentMethod;
import com.example.app.entity.PaymentStatus;
import com.example.app.entity.Role;
import com.example.app.entity.Transaction;
import com.example.app.entity.User;
import com.example.app.entity.UserStatus;
import com.example.app.repository.CategoryRepository;
import com.example.app.repository.CourseRepository;
import com.example.app.repository.EnrollmentRepository;
import com.example.app.repository.TransactionRepository;
import com.example.app.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Random;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository,
                                      CategoryRepository categoryRepository,
                                      CourseRepository courseRepository,
                                      EnrollmentRepository enrollmentRepository,
                                      TransactionRepository transactionRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setFullName("Admin System");
                admin.setEmail("admin@edu.vn");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }

            if (categoryRepository.count() == 0) {
                List<Category> categories = List.of(
                    createCategory("Web Dev", "web-dev"),
                    createCategory("Data Science", "data-science"),
                    createCategory("Business", "business"),
                    createCategory("Design", "design")
                );
                categoryRepository.saveAll(categories);
            }

            if (courseRepository.count() == 0) {
                Category webDev = categoryRepository.findByName("Web Dev").orElse(null);
                Category dataScience = categoryRepository.findByName("Data Science").orElse(null);
                Category business = categoryRepository.findByName("Business").orElse(null);
                Category design = categoryRepository.findByName("Design").orElse(null);

                Course c1 = new Course();
                c1.setTitle("ReactJS Toan tap: Tu co ban den nang cao");
                c1.setInstructorName("Nguyen Van A");
                c1.setThumbnailUrl("https://picsum.photos/seed/react/800/450");
                c1.setCategory(webDev);
                c1.setRatingAverage(4.8);
                c1.setReviewCount(1234);
                c1.setPrice(new BigDecimal("500000"));
                c1.setOriginalPrice(new BigDecimal("1000000"));
                c1.setTotalLessons(34);

                Course c2 = new Course();
                c2.setTitle("Python cho Data Science & Machine Learning");
                c2.setInstructorName("Le Thi B");
                c2.setThumbnailUrl("https://picsum.photos/seed/python/800/450");
                c2.setCategory(dataScience);
                c2.setRatingAverage(4.9);
                c2.setReviewCount(850);
                c2.setPrice(new BigDecimal("600000"));
                c2.setOriginalPrice(new BigDecimal("1200000"));
                c2.setTotalLessons(50);

                Course c3 = new Course();
                c3.setTitle("Digital Marketing 101: Chien luoc toan dien");
                c3.setInstructorName("Tran Van C");
                c3.setThumbnailUrl("https://picsum.photos/seed/marketing/800/450");
                c3.setCategory(business);
                c3.setRatingAverage(4.5);
                c3.setReviewCount(2100);
                c3.setPrice(new BigDecimal("300000"));
                c3.setOriginalPrice(new BigDecimal("800000"));
                c3.setTotalLessons(25);

                Course c4 = new Course();
                c4.setTitle("Thiet ke UX/UI co ban cho nguoi moi bat dau");
                c4.setInstructorName("Pham Thi D");
                c4.setThumbnailUrl("https://picsum.photos/seed/design/800/450");
                c4.setCategory(design);
                c4.setRatingAverage(4.7);
                c4.setReviewCount(560);
                c4.setPrice(new BigDecimal("450000"));
                c4.setOriginalPrice(new BigDecimal("900000"));
                c4.setTotalLessons(25);

                courseRepository.saveAll(List.of(c1, c2, c3, c4));
            }

            if (userRepository.count() < 10) {
                for (int i = 1; i <= 30; i++) {
                    User user = new User();
                    user.setFullName("Student " + i);
                    user.setEmail("student" + i + "@edu.vn");
                    user.setPasswordHash(passwordEncoder.encode("123456"));
                    user.setRole(Role.STUDENT);
                    user.setPhone("0900" + String.format("%06d", i));
                    user.setStatus(i % 10 == 0 ? UserStatus.LOCKED : i % 7 == 0 ? UserStatus.PENDING : UserStatus.ACTIVE);
                    user.setJoinDate(LocalDate.now().minusDays(i * 2L));
                    userRepository.save(user);
                }
            }

            if (enrollmentRepository.count() < 10) {
                List<User> students = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.STUDENT)
                    .toList();
                List<Course> courses = courseRepository.findAll();
                Random random = new Random(42);

                for (int i = 0; i < Math.min(40, students.size()); i++) {
                    User user = students.get(i);
                    Course course = courses.get(i % courses.size());
                    Enrollment enrollment = new Enrollment();
                    enrollment.setUser(user);
                    enrollment.setCourse(course);
                    enrollment.setStatus(i % 5 == 0 ? EnrollmentStatus.PENDING : EnrollmentStatus.APPROVED);
                    int progress = random.nextInt(101);
                    enrollment.setProgressPercent(progress);
                    enrollment.setTotalLessons(course.getTotalLessons());
                    enrollment.setCompletedLessons((int) Math.round(progress / 100.0 * course.getTotalLessons()));
                    enrollmentRepository.save(enrollment);
                }
            }

            if (transactionRepository.count() < 10) {
                List<User> students = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.STUDENT)
                    .toList();
                List<Course> courses = courseRepository.findAll();
                Random random = new Random(7);

                for (int i = 0; i < Math.min(30, students.size()); i++) {
                    User user = students.get(i);
                    Course course = courses.get(i % courses.size());
                    Transaction tx = new Transaction();
                    tx.setUser(user);
                    tx.setCourse(course);
                    tx.setAmount(course.getPrice());
                    tx.setStatus(i % 8 == 0 ? PaymentStatus.FAILED : PaymentStatus.SUCCESS);
                    tx.setMethod(i % 3 == 0 ? PaymentMethod.MOMO : i % 3 == 1 ? PaymentMethod.QR : PaymentMethod.CARD);
                    tx.setExternalRef("TXN-" + (1000 + i));

                    Instant createdAt = LocalDate.now()
                        .minusDays(random.nextInt(60))
                        .atStartOfDay(ZoneId.systemDefault())
                        .toInstant();
                    tx.setCreatedAt(createdAt);
                    transactionRepository.save(tx);
                }
            }
        };
    }

    private Category createCategory(String name, String slug) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        return category;
    }
}
