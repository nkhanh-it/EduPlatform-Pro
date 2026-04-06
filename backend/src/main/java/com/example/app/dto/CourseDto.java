package com.example.app.dto;

import com.example.app.entity.Course;

import java.math.BigDecimal;
import java.util.UUID;

public class CourseDto {

    private UUID id;
    private String title;
    private String instructor;
    private String thumbnail;
    private String category;
    private String description;
    private double rating;
    private int reviews;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer totalLessons;
    private boolean published;

    public static CourseDto fromEntity(Course course) {
        CourseDto dto = new CourseDto();
        dto.id = course.getId();
        dto.title = course.getTitle();
        dto.instructor = course.getInstructorName();
        dto.thumbnail = course.getThumbnailUrl();
        dto.category = course.getCategory() != null ? course.getCategory().getName() : null;
        dto.description = course.getDescription();
        dto.rating = course.getRatingAverage();
        dto.reviews = course.getReviewCount();
        dto.price = course.getPrice();
        dto.originalPrice = course.getOriginalPrice();
        dto.totalLessons = course.getTotalLessons();
        dto.published = course.isPublished();
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getInstructor() {
        return instructor;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public double getRating() {
        return rating;
    }

    public int getReviews() {
        return reviews;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public Integer getTotalLessons() {
        return totalLessons;
    }

    public boolean isPublished() {
        return published;
    }
}
