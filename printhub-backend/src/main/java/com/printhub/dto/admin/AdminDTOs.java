package com.printhub.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PastOrderSummary {
        private Long orderId;
        private String orderNumber;
        private String userName;
        private String userPhone;
        private int totalPages;
        private int totalCopies;
        private BigDecimal totalAmount;
        private String paymentStatus;
        private String paymentMethod;
        private String utr;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
    }
}
