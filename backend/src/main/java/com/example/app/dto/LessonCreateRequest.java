package com.example.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LessonCreateRequest {

    @NotBlank
    @Size(min = 2, max = 200)
    private String title;

    @Min(1)
    private int orderIndex;

    @Min(0)
    private int durationSeconds;

    private boolean preview;

    private String gumletPlaybackUrl;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public int getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(int durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public boolean isPreview() {
        return preview;
    }

    public void setPreview(boolean preview) {
        this.preview = preview;
    }

    public String getGumletPlaybackUrl() {
        return gumletPlaybackUrl;
    }

    public void setGumletPlaybackUrl(String gumletPlaybackUrl) {
        this.gumletPlaybackUrl = gumletPlaybackUrl;
    }
}
