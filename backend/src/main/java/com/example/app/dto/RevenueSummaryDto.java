package com.example.app.dto;

import java.math.BigDecimal;

public class RevenueSummaryDto {

    private BigDecimal totalRevenue;
    private long successfulTransactions;
    private long failedTransactions;

    public RevenueSummaryDto(BigDecimal totalRevenue, long successfulTransactions, long failedTransactions) {
        this.totalRevenue = totalRevenue;
        this.successfulTransactions = successfulTransactions;
        this.failedTransactions = failedTransactions;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public long getSuccessfulTransactions() {
        return successfulTransactions;
    }

    public long getFailedTransactions() {
        return failedTransactions;
    }
}
