package com.example.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class LessonUpdateRequest {

    @Size(min = 2, max = 200)
    private String title;

    @Min(1)
    private Integer orderIndex;

    @Min(0)
    private Integer durationSeconds;

    private Boolean preview;

    private String gumletPlaybackUrl;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Boolean getPreview() {
        return preview;
    }

    public void setPreview(Boolean preview) {
        this.preview = preview;
    }

    public String getGumletPlaybackUrl() {
        return gumletPlaybackUrl;
    }

    public void setGumletPlaybackUrl(String gumletPlaybackUrl) {
        this.gumletPlaybackUrl = gumletPlaybackUrl;
    }
}
