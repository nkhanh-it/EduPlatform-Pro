package com.example.app.dto;

import java.math.BigDecimal;

public class RevenueSummaryDto {

    private BigDecimal totalRevenue;
    private long successfulTransactions;
    private long failedTransactions;

    public RevenueSummaryDto() {
    }

    public RevenueSummaryDto(BigDecimal totalRevenue, long successfulTransactions, long failedTransactions) {
        this.totalRevenue = totalRevenue;
        this.successfulTransactions = successfulTransactions;
        this.failedTransactions = failedTransactions;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getSuccessfulTransactions() {
        return successfulTransactions;
    }

    public void setSuccessfulTransactions(long successfulTransactions) {
        this.successfulTransactions = successfulTransactions;
    }

    public long getFailedTransactions() {
        return failedTransactions;
    }

    public void setFailedTransactions(long failedTransactions) {
        this.failedTransactions = failedTransactions;
    }
}
