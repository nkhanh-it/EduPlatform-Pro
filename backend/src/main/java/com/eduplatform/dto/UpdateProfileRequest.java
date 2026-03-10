package com.eduplatform.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String displayName;
    private String bio;
    private String phone;
}
