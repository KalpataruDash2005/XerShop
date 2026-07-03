package com.printhub.dto.wallet;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class WalletDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WalletDTO {
        private Long id;
        private Long userId;
        private BigDecimal balance;
        private BigDecimal totalEarned;
        private BigDecimal totalSpent;
        private String referralCode;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WalletTransactionDTO {
        private Long id;
        private String type;
        private BigDecimal amount;
        private BigDecimal balanceAfter;
        private String description;
        private Long orderId;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WalletSummaryDTO {
        private BigDecimal balance;
        private BigDecimal totalEarned;
        private BigDecimal totalSpent;
        private List<WalletTransactionDTO> recentTransactions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddBalanceRequest {
        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be positive")
        private BigDecimal amount;
    }
}
