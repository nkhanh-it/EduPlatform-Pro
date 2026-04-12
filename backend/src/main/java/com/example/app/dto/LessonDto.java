package com.example.app.dto;

import com.example.app.entity.Lesson;

import java.util.UUID;

public class LessonDto {

    private UUID id;
    private String title;
    private int orderIndex;
    private int durationSeconds;
    private boolean preview;
    private UUID mediaFileId;
    private String mediaFileName;
    private boolean mediaProcessing;
    private boolean hlsReady;
    private String videoPlaybackUrl;

    public static LessonDto fromEntity(Lesson lesson) {
        return fromEntity(lesson, null);
    }

    public static LessonDto fromEntity(Lesson lesson, String playbackUrl) {
        LessonDto dto = new LessonDto();
        dto.id = lesson.getId();
        dto.title = lesson.getTitle();
        dto.orderIndex = lesson.getOrderIndex();
        dto.durationSeconds = lesson.getDurationSeconds();
        dto.preview = lesson.isPreview();
        dto.mediaFileId = lesson.getMediaFile() != null ? lesson.getMediaFile().getId() : null;
        dto.mediaFileName = lesson.getMediaFile() != null ? lesson.getMediaFile().getOriginalFileName() : null;
        dto.mediaProcessing = lesson.getMediaFile() != null && lesson.getMediaFile().isHlsProcessing();
        dto.hlsReady = lesson.getMediaFile() != null && lesson.getMediaFile().isHlsReady();
        dto.videoPlaybackUrl = playbackUrl;
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

    public UUID getMediaFileId() {
        return mediaFileId;
    }

    public String getMediaFileName() {
        return mediaFileName;
    }

    public boolean isMediaProcessing() {
        return mediaProcessing;
    }

    public boolean isHlsReady() {
        return hlsReady;
    }

    public String getVideoPlaybackUrl() {
        return videoPlaybackUrl;
    }
}
