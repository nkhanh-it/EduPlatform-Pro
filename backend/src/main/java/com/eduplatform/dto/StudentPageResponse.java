package com.eduplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class StudentPageResponse {
    private List<UserResponse> content;
    private int currentPage;
    private int pageSize;
    private long totalElements;
    private int totalPages;
}
