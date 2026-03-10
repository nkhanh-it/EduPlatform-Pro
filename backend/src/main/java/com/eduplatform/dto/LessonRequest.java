package com.eduplatform.dto;

import lombok.Data;

@Data
public class LessonRequest {
    private String title;
    private Integer orderIndex;
    private String videoUrl;
    private Integer durationMinutes;
    private String section;
}
