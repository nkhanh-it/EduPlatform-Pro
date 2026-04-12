package com.example.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "media_files")
public class MediaFile {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String storagePath;

    private String hlsDirectory;

    @Column(nullable = false)
    private String mimeType;

    @Column(nullable = false)
    private long sizeBytes;

    @Column(nullable = false)
    private boolean hlsReady;

    @Column(nullable = false)
    private boolean hlsProcessing;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getHlsDirectory() {
        return hlsDirectory;
    }

    public void setHlsDirectory(String hlsDirectory) {
        this.hlsDirectory = hlsDirectory;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public boolean isHlsReady() {
        return hlsReady;
    }

    public void setHlsReady(boolean hlsReady) {
        this.hlsReady = hlsReady;
    }

    public boolean isHlsProcessing() {
        return hlsProcessing;
    }

    public void setHlsProcessing(boolean hlsProcessing) {
        this.hlsProcessing = hlsProcessing;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
