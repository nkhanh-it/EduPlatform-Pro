package com.example.app.repository;

import com.example.app.entity.MediaUploadSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MediaUploadSessionRepository extends JpaRepository<MediaUploadSession, UUID> {
}
