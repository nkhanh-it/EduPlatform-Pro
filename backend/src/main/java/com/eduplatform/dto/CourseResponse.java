package com.eduplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String instructor;
    private String thumbnail;
    private String category;
    private Double rating;
    private Integer reviews;
    private Long price;
    private Long originalPrice;
    private Integer totalLessons;
    private Integer completedLessons;
    private Integer progress;
    private String status;
}
