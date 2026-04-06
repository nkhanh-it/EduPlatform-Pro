package com.example.app.dto;

import com.example.app.entity.Lesson;

import java.util.UUID;

public class LessonDto {

    private UUID id;
    private String title;
    private int orderIndex;
    private int durationSeconds;
    private boolean preview;
    private String gumletPlaybackUrl;

    public static LessonDto fromEntity(Lesson lesson) {
        return fromEntity(lesson, true);
    }

    public static LessonDto fromEntity(Lesson lesson, boolean includeVideo) {
        LessonDto dto = new LessonDto();
        dto.id = lesson.getId();
        dto.title = lesson.getTitle();
        dto.orderIndex = lesson.getOrderIndex();
        dto.durationSeconds = lesson.getDurationSeconds();
        dto.preview = lesson.isPreview();
        dto.gumletPlaybackUrl = includeVideo ? lesson.getGumletPlaybackUrl() : null;
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public int getDurationSeconds() {
        return durationSeconds;
    }

    public boolean isPreview() {
        return preview;
    }

    public String getGumletPlaybackUrl() {
        return gumletPlaybackUrl;
    }
}
