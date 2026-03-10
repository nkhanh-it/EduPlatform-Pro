package com.eduplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status;

    private LocalDate enrollDate;

    private Integer completedLessons;

    public enum EnrollmentStatus {
        PENDING, COMPLETED, REJECTED
    }

    @PrePersist
    protected void onCreate() {
        if (enrollDate == null) enrollDate = LocalDate.now();
        if (status == null) status = EnrollmentStatus.PENDING;
        if (completedLessons == null) completedLessons = 0;
    }
}
