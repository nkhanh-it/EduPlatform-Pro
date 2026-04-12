package com.example.app.controller;

import com.example.app.dto.MediaUploadInitRequest;
import com.example.app.dto.MediaUploadSessionDto;
import com.example.app.service.MediaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @PostMapping("/uploads")
    public ResponseEntity<MediaUploadSessionDto> createUploadSession(@Valid @RequestBody MediaUploadInitRequest request) {
        return ResponseEntity.ok(mediaService.createUploadSession(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @GetMapping("/uploads/{uploadId}")
    public ResponseEntity<MediaUploadSessionDto> getUploadSession(@PathVariable UUID uploadId) {
        return ResponseEntity.ok(mediaService.getUploadSession(uploadId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @PutMapping("/uploads/{uploadId}/chunks/{chunkIndex}")
    public ResponseEntity<MediaUploadSessionDto> uploadChunk(@PathVariable UUID uploadId,
                                                             @PathVariable int chunkIndex,
                                                             @RequestParam("chunk") MultipartFile chunk) {
        return ResponseEntity.ok(mediaService.uploadChunk(uploadId, chunkIndex, chunk));
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @PostMapping("/uploads/{uploadId}/complete")
    public ResponseEntity<MediaUploadSessionDto> completeUpload(@PathVariable UUID uploadId) {
        return ResponseEntity.ok(mediaService.completeUpload(uploadId));
    }

    @PostMapping("/playback/session")
    public ResponseEntity<Void> initializePlaybackSession(@RequestParam("token") String token) {
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, mediaService.createPlaybackSessionCookie(token).toString())
            .build();
    }

    @GetMapping("/play/{token}")
    public ResponseEntity<StreamingResponseBody> streamVideo(@PathVariable String token,
                                                             @CookieValue(value = "edu_media_session", required = false) String playbackSession,
                                                             @RequestHeader(value = "Range", required = false) String rangeHeader) {
        return mediaService.streamByToken(token, playbackSession, rangeHeader);
    }

    @GetMapping("/hls/{token}/master.m3u8")
    public ResponseEntity<StreamingResponseBody> streamManifest(@PathVariable String token,
                                                                @CookieValue(value = "edu_media_session", required = false) String playbackSession) {
        return mediaService.streamHlsManifest(token, playbackSession);
    }

    @GetMapping("/hls/{token}/{segmentName:.+}")
    public ResponseEntity<StreamingResponseBody> streamSegment(@PathVariable String token,
                                                               @CookieValue(value = "edu_media_session", required = false) String playbackSession,
                                                               @PathVariable String segmentName) {
        return mediaService.streamHlsSegment(token, playbackSession, segmentName);
    }
}
