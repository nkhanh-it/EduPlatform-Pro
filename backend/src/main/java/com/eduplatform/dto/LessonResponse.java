package com.eduplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class LessonResponse {
    private Long id;
    private Long courseId;
    private String title;
    private Integer orderIndex;
    private String videoUrl;
    private Integer durationMinutes;
    private String section;
}
