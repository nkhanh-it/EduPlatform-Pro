package com.example.app.dto;

import java.math.BigDecimal;

public class RevenuePointDto {

    private String name;
    private BigDecimal revenue;

    public RevenuePointDto() {
    }

    public RevenuePointDto(String name, BigDecimal revenue) {
        this.name = name;
        this.revenue = revenue;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }
}
