package com.example.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.media")
public class MediaProperties {

    private String storageRoot = "./data/media-private";
    private String publicBaseUrl = "http://localhost:8080";
    private long chunkSizeBytes = 5L * 1024L * 1024L;
    private long maxFileSizeBytes = 2L * 1024L * 1024L * 1024L;
    private long playbackTokenMinutes = 20;
    private String ffmpegPath = "ffmpeg";
    private int hlsSegmentSeconds = 6;

    public String getStorageRoot() {
        return storageRoot;
    }

    public void setStorageRoot(String storageRoot) {
        this.storageRoot = storageRoot;
    }

    public String getPublicBaseUrl() {
        return publicBaseUrl;
    }

    public void setPublicBaseUrl(String publicBaseUrl) {
        this.publicBaseUrl = publicBaseUrl;
    }

    public long getChunkSizeBytes() {
        return chunkSizeBytes;
    }

    public void setChunkSizeBytes(long chunkSizeBytes) {
        this.chunkSizeBytes = chunkSizeBytes;
    }

    public long getMaxFileSizeBytes() {
        return maxFileSizeBytes;
    }

    public void setMaxFileSizeBytes(long maxFileSizeBytes) {
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    public long getPlaybackTokenMinutes() {
        return playbackTokenMinutes;
    }

    public void setPlaybackTokenMinutes(long playbackTokenMinutes) {
        this.playbackTokenMinutes = playbackTokenMinutes;
    }

    public String getFfmpegPath() {
        return ffmpegPath;
    }

    public void setFfmpegPath(String ffmpegPath) {
        this.ffmpegPath = ffmpegPath;
    }

    public int getHlsSegmentSeconds() {
        return hlsSegmentSeconds;
    }

    public void setHlsSegmentSeconds(int hlsSegmentSeconds) {
        this.hlsSegmentSeconds = hlsSegmentSeconds;
    }
}
