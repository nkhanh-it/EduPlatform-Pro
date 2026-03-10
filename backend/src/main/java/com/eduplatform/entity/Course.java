package com.eduplatform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String instructor;

    private String thumbnail;

    private String category;

    @Column(nullable = false)
    private Double rating;

    private Integer reviews;

    @Column(nullable = false)
    private Long price;

    private Long originalPrice;

    private Integer totalLessons;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CourseStatus status;

    @Lob
    private String description;

    public enum CourseStatus {
        PUBLIC, DRAFT
    }

    @PrePersist
    protected void onCreate() {
        if (rating == null) rating = 0.0;
        if (reviews == null) reviews = 0;
        if (status == null) status = CourseStatus.PUBLIC;
    }
}
