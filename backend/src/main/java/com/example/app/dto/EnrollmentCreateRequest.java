package com.example.app.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class EnrollmentCreateRequest {

    @NotNull
    private UUID courseId;

    public UUID getCourseId() {
        return courseId;
    }

    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }
}
