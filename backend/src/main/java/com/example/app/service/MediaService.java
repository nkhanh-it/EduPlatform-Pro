package com.example.app.service;

import com.example.app.config.JwtProperties;
import com.example.app.config.MediaProperties;
import com.example.app.dto.MediaUploadInitRequest;
import com.example.app.dto.MediaUploadSessionDto;
import com.example.app.entity.MediaFile;
import com.example.app.entity.MediaUploadSession;
import com.example.app.entity.MediaUploadStatus;
import com.example.app.exception.BadRequestException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.MediaFileRepository;
import com.example.app.repository.MediaUploadSessionRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MediaService {

    private static final int MEDIA_BUFFER_SIZE = 1024 * 1024;
    private static final String PLAYBACK_SESSION_COOKIE = "edu_media_session";
    private static final long PLAYBACK_SESSION_TTL_SECONDS = 120;

    private final MediaUploadSessionRepository uploadSessionRepository;
    private final MediaFileRepository mediaFileRepository;
    private final MediaProperties mediaProperties;
    private final JwtProperties jwtProperties;
    private SecretKey playbackKey;

    public MediaService(MediaUploadSessionRepository uploadSessionRepository,
                        MediaFileRepository mediaFileRepository,
                        MediaProperties mediaProperties,
                        JwtProperties jwtProperties) {
        this.uploadSessionRepository = uploadSessionRepository;
        this.mediaFileRepository = mediaFileRepository;
        this.mediaProperties = mediaProperties;
        this.jwtProperties = jwtProperties;
    }

    @PostConstruct
    public void init() throws IOException {
        playbackKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        Files.createDirectories(getStorageRoot());
        Files.createDirectories(getTempRoot());
    }

    public MediaUploadSessionDto createUploadSession(MediaUploadInitRequest request) {
        String fileName = normalizeFileName(request.getFileName());
        String mimeType = normalizeMimeType(request.getMimeType());
        long totalSize = request.getTotalSize();
        long chunkSize = request.getChunkSize() > 0 ? request.getChunkSize() : mediaProperties.getChunkSizeBytes();

        if (totalSize <= 0) {
            throw new BadRequestException("File size is invalid");
        }
        if (totalSize > mediaProperties.getMaxFileSizeBytes()) {
            throw new BadRequestException("File exceeds the maximum allowed size");
        }
        if (chunkSize <= 0 || chunkSize > mediaProperties.getMaxFileSizeBytes()) {
            throw new BadRequestException("Chunk size is invalid");
        }

        MediaUploadSession session = new MediaUploadSession();
        session.setOriginalFileName(fileName);
        session.setMimeType(mimeType);
        session.setTotalSize(totalSize);
        session.setChunkSize(chunkSize);
        session.setTotalChunks((int) Math.ceil((double) totalSize / (double) chunkSize));
        session.setUploadedChunks(0);
        session.setStatus(MediaUploadStatus.CREATED);
        session.setTempDirectory(UUID.randomUUID().toString());

        MediaUploadSession saved = uploadSessionRepository.save(session);
        ensureUploadDirectory(saved);
        return buildUploadSessionDto(saved);
    }

    public MediaUploadSessionDto getUploadSession(UUID uploadId) {
        return buildUploadSessionDto(getUploadSessionEntity(uploadId));
    }

    public MediaUploadSessionDto uploadChunk(UUID uploadId, int chunkIndex, MultipartFile chunk) {
        MediaUploadSession session = getUploadSessionEntity(uploadId);
        if (session.getStatus() == MediaUploadStatus.COMPLETED) {
            throw new BadRequestException("Upload session is already completed");
        }
        if (chunkIndex < 0 || chunkIndex >= session.getTotalChunks()) {
            throw new BadRequestException("Chunk index is out of range");
        }
        if (chunk == null || chunk.isEmpty()) {
            throw new BadRequestException("Chunk payload is empty");
        }
        validateChunkSize(session, chunkIndex, chunk.getSize());

        Path uploadDir = ensureUploadDirectory(session);
        Path chunkPath = uploadDir.resolve(chunkIndex + ".part");
        try (InputStream inputStream = new BufferedInputStream(chunk.getInputStream(), MEDIA_BUFFER_SIZE)) {
            storeChunkStream(inputStream, chunkPath);
        } catch (IOException exception) {
            session.setStatus(MediaUploadStatus.FAILED);
            uploadSessionRepository.save(session);
            throw new BadRequestException("Failed to store upload chunk");
        }

        session.setStatus(MediaUploadStatus.UPLOADING);
        session.setUploadedChunks(countUploadedChunks(uploadDir));
        return buildUploadSessionDto(uploadSessionRepository.save(session));
    }

    public MediaUploadSessionDto completeUpload(UUID uploadId) {
        MediaUploadSession session = getUploadSessionEntity(uploadId);
        if (session.getStatus() == MediaUploadStatus.COMPLETED && session.getMediaFileId() != null) {
            return buildUploadSessionDto(session);
        }

        Path uploadDir = ensureUploadDirectory(session);
        if (countUploadedChunks(uploadDir) != session.getTotalChunks()) {
            throw new BadRequestException("Upload is incomplete");
        }

        MediaFile mediaFile = new MediaFile();
        mediaFile.setOriginalFileName(session.getOriginalFileName());
        mediaFile.setMimeType(session.getMimeType());
        mediaFile.setSizeBytes(session.getTotalSize());
        mediaFile.setStoragePath(buildStoragePath(session.getOriginalFileName()));
        mediaFile.setHlsDirectory(buildHlsDirectory());
        mediaFile.setHlsReady(false);
        mediaFile.setHlsProcessing(true);
        MediaFile savedMedia = mediaFileRepository.save(mediaFile);

        Path finalFile = resolveStoredFilePath(savedMedia);
        try {
            Files.createDirectories(finalFile.getParent());
            mergeChunks(uploadDir, finalFile, session.getTotalChunks());
            session.setStatus(MediaUploadStatus.COMPLETED);
            session.setUploadedChunks(session.getTotalChunks());
            session.setMediaFileId(savedMedia.getId());
            deleteDirectory(uploadDir);
            scheduleHlsTranscode(savedMedia.getId(), finalFile);
        } catch (IOException exception) {
            session.setStatus(MediaUploadStatus.FAILED);
            savedMedia.setHlsProcessing(false);
            mediaFileRepository.save(savedMedia);
            try {
                Files.deleteIfExists(finalFile);
            } catch (IOException ignored) {
            }
            throw new BadRequestException("Failed to finalize uploaded file");
        }

        uploadSessionRepository.save(session);
        return buildUploadSessionDto(session);
    }

    public MediaFile getMediaFile(UUID mediaFileId) {
        return mediaFileRepository.findById(mediaFileId)
            .orElseThrow(() -> new ResourceNotFoundException("Media file not found"));
    }

    public String createPlaybackUrl(MediaFile mediaFile, UUID lessonId, boolean preview, String userEmail) {
        Instant expiresAt = Instant.now().plusSeconds(mediaProperties.getPlaybackTokenMinutes() * 60);
        String token = Jwts.builder()
            .claim("mediaFileId", mediaFile.getId().toString())
            .claim("lessonId", lessonId != null ? lessonId.toString() : null)
            .claim("preview", preview)
            .claim("userEmail", userEmail)
            .setExpiration(java.util.Date.from(expiresAt))
            .signWith(playbackKey, SignatureAlgorithm.HS256)
            .compact();

        if (mediaFile.isHlsReady()) {
            return mediaProperties.getPublicBaseUrl() + "/api/media/hls/" +
                URLEncoder.encode(token, StandardCharsets.UTF_8) + "/master.m3u8";
        }

        return mediaProperties.getPublicBaseUrl() + "/api/media/play/" +
            URLEncoder.encode(token, StandardCharsets.UTF_8);
    }

    public ResponseCookie createPlaybackSessionCookie(String token) {
        authorizePlaybackToken(token, null, false);

        String sessionToken = Jwts.builder()
            .claim("tokenHash", sha256(token))
            .setExpiration(java.util.Date.from(Instant.now().plusSeconds(PLAYBACK_SESSION_TTL_SECONDS)))
            .signWith(playbackKey, SignatureAlgorithm.HS256)
            .compact();

        return ResponseCookie.from(PLAYBACK_SESSION_COOKIE, sessionToken)
            .httpOnly(true)
            .sameSite("Lax")
            .path("/api/media")
            .maxAge(PLAYBACK_SESSION_TTL_SECONDS)
            .build();
    }

    public ResponseEntity<StreamingResponseBody> streamByToken(String token, String playbackSession, String rangeHeader) {
        MediaFile mediaFile = authorizePlaybackToken(token, playbackSession, true);
        Path filePath = resolveStoredFilePath(mediaFile);
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("Video file not found");
        }

        try {
            long fileSize = Files.size(filePath);
            MediaType mediaType = parseMediaType(mediaFile.getMimeType());
            if (rangeHeader == null || rangeHeader.isBlank()) {
                StreamingResponseBody body = outputStream -> streamRange(filePath, outputStream, 0, fileSize - 1);
                return ResponseEntity.ok()
                    .contentType(mediaType)
                    .contentLength(fileSize)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "no-store")
                    .body(body);
            }

            List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
            if (ranges.isEmpty()) {
                throw new BadRequestException("Invalid range header");
            }

            HttpRange range = ranges.get(0);
            long start = range.getRangeStart(fileSize);
            long end = range.getRangeEnd(fileSize);
            long contentLength = end - start + 1;

            StreamingResponseBody body = outputStream -> streamRange(filePath, outputStream, start, end);
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .contentType(mediaType)
                .contentLength(contentLength)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileSize)
                .body(body);
        } catch (IOException exception) {
            throw new BadRequestException("Unable to stream media file");
        }
    }

    public ResponseEntity<StreamingResponseBody> streamHlsManifest(String token, String playbackSession) {
        MediaFile mediaFile = authorizePlaybackToken(token, playbackSession, true);
        if (!mediaFile.isHlsReady()) {
            throw new ResourceNotFoundException("HLS manifest not found");
        }

        Path manifestPath = resolveHlsDirectory(mediaFile).resolve("master.m3u8");
        if (!Files.exists(manifestPath)) {
            throw new ResourceNotFoundException("HLS manifest not found");
        }

        StreamingResponseBody body = outputStream -> Files.copy(manifestPath, outputStream);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            .body(body);
    }

    public ResponseEntity<StreamingResponseBody> streamHlsSegment(String token, String playbackSession, String segmentName) {
        MediaFile mediaFile = authorizePlaybackToken(token, playbackSession, true);
        if (!mediaFile.isHlsReady()) {
            throw new ResourceNotFoundException("HLS segment not found");
        }

        if (segmentName.contains("..") || segmentName.contains("/") || segmentName.contains("\\")) {
            throw new BadRequestException("Segment name is invalid");
        }

        Path segmentPath = resolveHlsDirectory(mediaFile).resolve(segmentName);
        if (!Files.exists(segmentPath) || !Files.isRegularFile(segmentPath)) {
            throw new ResourceNotFoundException("HLS segment not found");
        }

        MediaType contentType = segmentName.endsWith(".m3u8")
            ? MediaType.parseMediaType("application/vnd.apple.mpegurl")
            : MediaType.parseMediaType("video/mp2t");

        StreamingResponseBody body = outputStream -> Files.copy(segmentPath, outputStream);
        try {
            return ResponseEntity.ok()
                .contentType(contentType)
                .contentLength(Files.size(segmentPath))
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(body);
        } catch (IOException exception) {
            throw new BadRequestException("Unable to stream HLS segment");
        }
    }

    private Claims parsePlaybackToken(String token) {
        try {
            return Jwts.parserBuilder()
                .setSigningKey(playbackKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        } catch (Exception exception) {
            throw new BadRequestException("Playback token is invalid");
        }
    }

    private MediaFile authorizePlaybackToken(String token, String playbackSession, boolean requirePlaybackSession) {
        Claims claims = parsePlaybackToken(token);
        UUID mediaFileId = UUID.fromString(claims.get("mediaFileId", String.class));
        if (requirePlaybackSession) {
            validatePlaybackSession(token, playbackSession);
        }
        return getMediaFile(mediaFileId);
    }

    private void validatePlaybackSession(String token, String playbackSession) {
        if (playbackSession == null || playbackSession.isBlank()) {
            throw new ResourceNotFoundException("Media resource not found");
        }

        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(playbackKey)
                .build()
                .parseClaimsJws(playbackSession)
                .getBody();

            String tokenHash = claims.get("tokenHash", String.class);
            if (tokenHash == null || !tokenHash.equals(sha256(token))) {
                throw new ResourceNotFoundException("Media resource not found");
            }
        } catch (ResourceNotFoundException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResourceNotFoundException("Media resource not found");
        }
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private void streamRange(Path filePath, OutputStream outputStream, long start, long end) throws IOException {
        byte[] buffer = new byte[8192];
        long remaining = end - start + 1;
        try (RandomAccessFile file = new RandomAccessFile(filePath.toFile(), "r")) {
            file.seek(start);
            while (remaining > 0) {
                int bytesToRead = (int) Math.min(buffer.length, remaining);
                int bytesRead = file.read(buffer, 0, bytesToRead);
                if (bytesRead == -1) {
                    break;
                }
                outputStream.write(buffer, 0, bytesRead);
                remaining -= bytesRead;
            }
        }
    }

    private MediaUploadSession getUploadSessionEntity(UUID uploadId) {
        return uploadSessionRepository.findById(uploadId)
            .orElseThrow(() -> new ResourceNotFoundException("Upload session not found"));
    }

    private Path ensureUploadDirectory(MediaUploadSession session) {
        Path directory = getTempRoot().resolve(session.getTempDirectory());
        try {
            Files.createDirectories(directory);
        } catch (IOException exception) {
            throw new BadRequestException("Failed to prepare upload directory");
        }
        return directory;
    }

    private int countUploadedChunks(Path uploadDir) {
        try {
            if (!Files.exists(uploadDir)) {
                return 0;
            }
            try (var paths = Files.list(uploadDir)) {
                return (int) paths.filter(Files::isRegularFile).count();
            }
        } catch (IOException exception) {
            throw new BadRequestException("Failed to inspect upload chunks");
        }
    }

    private long countUploadedBytes(Path uploadDir) {
        try {
            if (!Files.exists(uploadDir)) {
                return 0L;
            }
            try (var paths = Files.list(uploadDir)) {
                return paths
                    .filter(Files::isRegularFile)
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException exception) {
                            throw new RuntimeException(exception);
                        }
                    })
                    .sum();
            }
        } catch (RuntimeException exception) {
            if (exception.getCause() instanceof IOException) {
                throw new BadRequestException("Failed to inspect uploaded byte size");
            }
            throw exception;
        } catch (IOException exception) {
            throw new BadRequestException("Failed to inspect uploaded byte size");
        }
    }

    private void mergeChunks(Path uploadDir, Path finalFile, int totalChunks) throws IOException {
        try (OutputStream outputStream = new BufferedOutputStream(Files.newOutputStream(finalFile), MEDIA_BUFFER_SIZE)) {
            for (int index = 0; index < totalChunks; index++) {
                Path chunkPath = uploadDir.resolve(index + ".part");
                if (!Files.exists(chunkPath)) {
                    throw new BadRequestException("Missing upload chunk " + index);
                }
                try (InputStream inputStream = new BufferedInputStream(Files.newInputStream(chunkPath), MEDIA_BUFFER_SIZE)) {
                    copyStream(inputStream, outputStream);
                }
            }
        }
    }

    private void scheduleHlsTranscode(UUID mediaFileId, Path inputFile) {
        CompletableFuture.runAsync(
            () -> processHlsTranscode(mediaFileId, inputFile),
            CompletableFuture.delayedExecutor(1, TimeUnit.SECONDS)
        );
    }

    private void processHlsTranscode(UUID mediaFileId, Path inputFile) {
        MediaFile mediaFile = mediaFileRepository.findById(mediaFileId).orElse(null);
        if (mediaFile == null) {
            return;
        }

        try {
            tryTranscodeToHls(inputFile, mediaFile);
        } catch (IOException exception) {
            cleanupFailedHlsOutput(mediaFile);
            mediaFile.setHlsReady(false);
            mediaFile.setHlsProcessing(false);
            mediaFileRepository.save(mediaFile);
        }
    }

    private void validateChunkSize(MediaUploadSession session, int chunkIndex, long actualSize) {
        long expectedSize = expectedChunkSize(session, chunkIndex);
        if (actualSize != expectedSize) {
            throw new BadRequestException("Chunk size does not match the expected upload layout");
        }
    }

    private long expectedChunkSize(MediaUploadSession session, int chunkIndex) {
        long startOffset = (long) chunkIndex * session.getChunkSize();
        long remaining = session.getTotalSize() - startOffset;
        return Math.min(session.getChunkSize(), Math.max(remaining, 0L));
    }

    private void storeChunkStream(InputStream inputStream, Path chunkPath) throws IOException {
        Files.createDirectories(chunkPath.getParent());
        try (OutputStream outputStream = new BufferedOutputStream(Files.newOutputStream(chunkPath), MEDIA_BUFFER_SIZE)) {
            copyStream(inputStream, outputStream);
        }
    }

    private void copyStream(InputStream inputStream, OutputStream outputStream) throws IOException {
        byte[] buffer = new byte[MEDIA_BUFFER_SIZE];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            outputStream.write(buffer, 0, bytesRead);
        }
    }

    private MediaUploadSessionDto buildUploadSessionDto(MediaUploadSession session) {
        if (session.getStatus() == MediaUploadStatus.COMPLETED) {
            return MediaUploadSessionDto.fromEntity(session, session.getTotalSize());
        }
        return MediaUploadSessionDto.fromEntity(session, countUploadedBytes(resolveUploadDirectory(session)));
    }

    private void deleteDirectory(Path directory) throws IOException {
        if (!Files.exists(directory)) {
            return;
        }
        try (var paths = Files.walk(directory)) {
            paths.sorted(Comparator.reverseOrder())
                .forEach(path -> {
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException ignored) {
                    }
                });
        }
    }

    public void deleteMediaFileAssets(UUID mediaFileId) {
        MediaFile mediaFile = getMediaFile(mediaFileId);
        Path storedFilePath = resolveStoredFilePath(mediaFile);
        Path hlsDirectory = mediaFile.getHlsDirectory() == null || mediaFile.getHlsDirectory().isBlank()
            ? null
            : resolveHlsDirectory(mediaFile);

        try {
            Files.deleteIfExists(storedFilePath);
            if (hlsDirectory != null) {
                deleteDirectory(hlsDirectory);
            }
        } catch (IOException exception) {
            throw new BadRequestException("Failed to delete media file assets");
        }

        mediaFileRepository.delete(mediaFile);
    }

    private Path resolveStoredFilePath(MediaFile mediaFile) {
        return getStorageRoot().resolve(mediaFile.getStoragePath());
    }

    private Path resolveHlsDirectory(MediaFile mediaFile) {
        return getStorageRoot().resolve(mediaFile.getHlsDirectory());
    }

    private String buildStoragePath(String originalFileName) {
        String extension = "";
        int lastDot = originalFileName.lastIndexOf('.');
        if (lastDot >= 0) {
            extension = originalFileName.substring(lastDot);
        }
        YearMonth now = YearMonth.now();
        return Path.of("files", String.valueOf(now.getYear()), String.format("%02d", now.getMonthValue()),
            UUID.randomUUID() + extension).toString();
    }

    private String buildHlsDirectory() {
        YearMonth now = YearMonth.now();
        return Path.of("hls", String.valueOf(now.getYear()), String.format("%02d", now.getMonthValue()),
            UUID.randomUUID().toString()).toString();
    }

    private void tryTranscodeToHls(Path inputFile, MediaFile mediaFile) throws IOException {
        Path hlsDir = resolveHlsDirectory(mediaFile);
        Files.createDirectories(hlsDir);
        Path manifestPath = hlsDir.resolve("master.m3u8");
        Path segmentPattern = hlsDir.resolve("segment_%03d.ts");

        ProcessBuilder processBuilder = new ProcessBuilder(
            mediaProperties.getFfmpegPath(),
            "-y",
            "-i", inputFile.toString(),
            "-codec:v", "libx264",
            "-codec:a", "aac",
            "-preset", "veryfast",
            "-g", String.valueOf(Math.max(mediaProperties.getHlsSegmentSeconds() * 2, 12)),
            "-sc_threshold", "0",
            "-hls_time", String.valueOf(mediaProperties.getHlsSegmentSeconds()),
            "-hls_playlist_type", "vod",
            "-hls_segment_filename", segmentPattern.toString(),
            manifestPath.toString()
        );
        processBuilder.redirectErrorStream(true);

        Process process;
        try {
            process = processBuilder.start();
        } catch (IOException exception) {
            cleanupFailedHlsOutput(mediaFile);
            mediaFile.setHlsReady(false);
            mediaFile.setHlsProcessing(false);
            mediaFileRepository.save(mediaFile);
            return;
        }

        String output;
        try (InputStream inputStream = process.getInputStream()) {
            output = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }

        try {
            int exitCode = process.waitFor();
            if (exitCode != 0 || !Files.exists(manifestPath)) {
                cleanupFailedHlsOutput(mediaFile);
                mediaFile.setHlsReady(false);
                mediaFile.setHlsProcessing(false);
                mediaFileRepository.save(mediaFile);
                return;
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            cleanupFailedHlsOutput(mediaFile);
            mediaFile.setHlsReady(false);
            mediaFile.setHlsProcessing(false);
            mediaFileRepository.save(mediaFile);
            return;
        }

        mediaFile.setHlsReady(true);
        mediaFile.setHlsProcessing(false);
        mediaFileRepository.save(mediaFile);
    }

    private String normalizeFileName(String fileName) {
        String normalized = fileName == null ? "" : fileName.trim();
        if (normalized.isBlank()) {
            throw new BadRequestException("File name is required");
        }
        return normalized.replace("\\", "_").replace("/", "_");
    }

    private String normalizeMimeType(String mimeType) {
        String normalized = mimeType == null ? "" : mimeType.trim();
        if (normalized.isBlank()) {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return normalized;
    }

    private MediaType parseMediaType(String mimeType) {
        try {
            return MediaType.parseMediaType(mimeType);
        } catch (Exception exception) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private void cleanupFailedHlsOutput(MediaFile mediaFile) {
        if (mediaFile.getHlsDirectory() == null || mediaFile.getHlsDirectory().isBlank()) {
            return;
        }
        try {
            deleteDirectory(resolveHlsDirectory(mediaFile));
        } catch (IOException ignored) {
        }
    }

    private Path getStorageRoot() {
        return Path.of(mediaProperties.getStorageRoot()).toAbsolutePath().normalize();
    }

    private Path getTempRoot() {
        return getStorageRoot().resolve("temp");
    }

    private Path resolveUploadDirectory(MediaUploadSession session) {
        return getTempRoot().resolve(session.getTempDirectory());
    }
}
