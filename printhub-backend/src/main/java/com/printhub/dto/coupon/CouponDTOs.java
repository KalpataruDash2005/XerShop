package com.printhub.dto.coupon;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CouponDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CouponDTO {
        private Long id;
        private String code;
        private String description;
        private String type;
        private BigDecimal value;
        private BigDecimal minOrderAmount;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private Integer usedCount;
        private Boolean isActive;
        private Boolean isPlatformWide;
        private Long shopId;
        private String shopName;
        private LocalDateTime validFrom;
        private LocalDateTime validUntil;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCouponRequest {
        @NotBlank(message = "Code is required")
        @Size(max = 50, message = "Code must not exceed 50 characters")
        private String code;

        private String description;

        @NotBlank(message = "Type is required")
        private String type;

        @NotNull(message = "Value is required")
        @Positive(message = "Value must be positive")
        private BigDecimal value;

        private BigDecimal minOrderAmount;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private Boolean isPlatformWide;
        private Long shopId;
        private LocalDateTime validFrom;
        private LocalDateTime validUntil;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCouponRequest {
        private String description;
        private BigDecimal value;
        private BigDecimal minOrderAmount;
        private BigDecimal maxDiscountAmount;
        private Integer usageLimit;
        private Boolean isActive;
        private LocalDateTime validFrom;
        private LocalDateTime validUntil;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyCouponRequest {
        @NotBlank(message = "Coupon code is required")
        private String code;

        @NotNull(message = "Order amount is required")
        private BigDecimal orderAmount;

        private Long shopId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CouponValidationResponse {
        private Boolean isValid;
        private String message;
        private BigDecimal discountAmount;
        private Long couponId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicableCouponDTO {
        private Long id;
        private String code;
        private String description;
        private String type;
        private BigDecimal value;
        private BigDecimal minOrderAmount;
        private BigDecimal maxDiscountAmount;
        private BigDecimal estimatedDiscount;
    }
}
