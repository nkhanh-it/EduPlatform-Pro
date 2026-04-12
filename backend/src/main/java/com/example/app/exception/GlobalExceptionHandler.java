package com.example.app.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        if (shouldRenderHtmlNotFound(request)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.TEXT_HTML)
                .body(buildHtmlNotFoundPage());
        }
        ApiErrorResponse response = new ApiErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
        ApiErrorResponse response = new ApiErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.joining(", "));

        ApiErrorResponse response = new ApiErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation Error",
            message,
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApi(ApiException ex, HttpServletRequest request) {
        ApiErrorResponse response = new ApiErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception for {}", request.getRequestURI(), ex);
        ApiErrorResponse response = new ApiErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            "Unexpected error occurred",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private boolean shouldRenderHtmlNotFound(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String accept = request.getHeader("Accept");
        return uri != null
            && uri.startsWith("/api/media/")
            && accept != null
            && accept.contains("text/html");
    }

    private String buildHtmlNotFoundPage() {
        return """
            <!doctype html>
            <html lang="vi">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>404 | EduPlatform Pro</title>
              <style>
                :root { color-scheme: dark; }
                * { box-sizing: border-box; }
                body {
                  margin: 0;
                  min-height: 100vh;
                  display: grid;
                  place-items: center;
                  padding: 24px;
                  font-family: Inter, system-ui, sans-serif;
                  background:
                    radial-gradient(circle at top left, rgba(59,130,246,.22), transparent 34%),
                    radial-gradient(circle at top right, rgba(14,165,233,.14), transparent 28%),
                    linear-gradient(180deg, #0f172a, #020617);
                  color: #e5eefb;
                }
                .card {
                  width: min(92vw, 620px);
                  padding: 34px;
                  border: 1px solid rgba(148,163,184,.14);
                  border-radius: 30px;
                  background:
                    linear-gradient(180deg, rgba(15,23,42,.92), rgba(15,23,42,.84));
                  box-shadow: 0 28px 90px rgba(2,6,23,.5);
                  backdrop-filter: blur(14px);
                }
                .brand {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  margin-bottom: 26px;
                  color: #cbd5e1;
                  font-size: 13px;
                  font-weight: 700;
                  letter-spacing: .08em;
                  text-transform: uppercase;
                }
                .brand-mark {
                  width: 36px;
                  height: 36px;
                  border-radius: 999px;
                  display: grid;
                  place-items: center;
                  background: linear-gradient(135deg, rgba(59,130,246,.9), rgba(14,165,233,.85));
                  color: white;
                  box-shadow: 0 14px 30px rgba(37,99,235,.3);
                }
                .eyebrow {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  margin-bottom: 18px;
                  padding: 8px 14px;
                  border-radius: 999px;
                  background: rgba(59,130,246,.12);
                  color: #93c5fd;
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: .16em;
                  text-transform: uppercase;
                }
                h1 {
                  margin: 0 0 12px;
                  font-size: clamp(34px, 6vw, 52px);
                  line-height: 1.05;
                  letter-spacing: -0.03em;
                }
                p {
                  margin: 0;
                  color: #94a3b8;
                  line-height: 1.7;
                  font-size: 15px;
                  max-width: 48ch;
                }
                .actions {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 12px;
                  margin-top: 28px;
                }
                .button {
                  appearance: none;
                  border: 0;
                  border-radius: 16px;
                  padding: 13px 18px;
                  font: inherit;
                  font-weight: 700;
                  text-decoration: none;
                  transition: transform .18s ease, opacity .18s ease, background-color .18s ease;
                }
                .button:hover {
                  transform: translateY(-1px);
                }
                .button-primary {
                  background: linear-gradient(135deg, #2563eb, #1d4ed8);
                  color: white;
                  box-shadow: 0 16px 32px rgba(37,99,235,.28);
                }
                .button-secondary {
                  background: rgba(148,163,184,.10);
                  color: #dbeafe;
                  border: 1px solid rgba(148,163,184,.16);
                }
                .note {
                  margin-top: 20px;
                  font-size: 13px;
                  color: #64748b;
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="brand">
                  <div class="brand-mark">E</div>
                  <div>EduPlatform Pro</div>
                </div>
                <div class="eyebrow">404 • Media Locked</div>
                <h1>Không thể mở video trực tiếp</h1>
                <p>Liên kết phát này chỉ hoạt động khi được mở từ bên trong hệ thống học. Nếu phiên xem đã hết hạn hoặc thiếu cookie bảo vệ, video sẽ không hiển thị.</p>
                <div class="actions">
                  <a class="button button-primary" href="http://localhost:3000/">Quay về trang chủ</a>
                  <a class="button button-secondary" href="javascript:history.back()">Quay lại</a>
                </div>
                <div class="note">Mở lại video từ trang khóa học để hệ thống tạo phiên phát mới.</div>
              </div>
            </body>
            </html>
            """;
    }
}
