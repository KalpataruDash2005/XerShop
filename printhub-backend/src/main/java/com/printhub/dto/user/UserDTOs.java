package com.printhub.dto.user;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String role;
        private Boolean isVerified;
        private String profileImageUrl;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
        private String name;

        @Email(message = "Invalid email format")
        private String email;

        private String profileImageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatsDTO {
        private Long totalOrders;
        private Long completedOrders;
        private Long pendingOrders;
        private Double totalSpent;
        private Double walletBalance;
        private Integer referralCount;
    }
}
