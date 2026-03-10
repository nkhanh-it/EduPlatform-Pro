package com.eduplatform.dto;

import lombok.Data;

@Data
public class CourseRequest {
    private String title;
    private String instructor;
    private String thumbnail;
    private String category;
    private Long price;
    private Long originalPrice;
    private Integer totalLessons;
    private String description;
    private String status; // PUBLIC or DRAFT
}
