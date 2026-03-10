package com.eduplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private String role;
    private String status;
    private String joinDate;
    private Long coursesEnrolled;
    private String bio;
    private String displayName;
}
