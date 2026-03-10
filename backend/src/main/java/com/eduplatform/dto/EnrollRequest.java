package com.eduplatform.dto;

import lombok.Data;

@Data
public class EnrollRequest {
    private Long courseId;
    private String paymentMethod; // card, momo, qr
}
