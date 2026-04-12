package com.example.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class MediaUploadInitRequest {

    @NotBlank
    private String fileName;

    @NotBlank
    private String mimeType;

    @Min(1)
    private long totalSize;

    @Min(1)
    private long chunkSize;

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public long getTotalSize() {
        return totalSize;
    }

    public void setTotalSize(long totalSize) {
        this.totalSize = totalSize;
    }

    public long getChunkSize() {
        return chunkSize;
    }

    public void setChunkSize(long chunkSize) {
        this.chunkSize = chunkSize;
    }
}
