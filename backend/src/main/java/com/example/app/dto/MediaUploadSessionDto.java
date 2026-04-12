package com.example.app.dto;

import com.example.app.entity.MediaUploadSession;

import java.util.UUID;

public class MediaUploadSessionDto {

    private UUID uploadId;
    private String status;
    private long totalSize;
    private long chunkSize;
    private int totalChunks;
    private int uploadedChunks;
    private long uploadedBytes;
    private boolean completed;
    private UUID mediaFileId;

    public static MediaUploadSessionDto fromEntity(MediaUploadSession session) {
        return fromEntity(session, 0L);
    }

    public static MediaUploadSessionDto fromEntity(MediaUploadSession session, long uploadedBytes) {
        MediaUploadSessionDto dto = new MediaUploadSessionDto();
        dto.uploadId = session.getId();
        dto.status = session.getStatus().name();
        dto.totalSize = session.getTotalSize();
        dto.chunkSize = session.getChunkSize();
        dto.totalChunks = session.getTotalChunks();
        dto.uploadedChunks = session.getUploadedChunks();
        dto.uploadedBytes = uploadedBytes;
        dto.completed = session.getStatus().name().equals("COMPLETED");
        dto.mediaFileId = session.getMediaFileId();
        return dto;
    }

    public UUID getUploadId() {
        return uploadId;
    }

    public String getStatus() {
        return status;
    }

    public long getTotalSize() {
        return totalSize;
    }

    public long getChunkSize() {
        return chunkSize;
    }

    public int getTotalChunks() {
        return totalChunks;
    }

    public int getUploadedChunks() {
        return uploadedChunks;
    }

    public long getUploadedBytes() {
        return uploadedBytes;
    }

    public boolean isCompleted() {
        return completed;
    }

    public UUID getMediaFileId() {
        return mediaFileId;
    }
}
