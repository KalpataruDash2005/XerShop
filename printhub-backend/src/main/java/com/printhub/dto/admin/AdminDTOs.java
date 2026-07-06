package com.printhub.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStatsDTO {
        private Long totalUsers;
        private Long totalShops;
        private Long activeShops;
        private Long totalOrders;
        private Long completedOrders;
        private Long pendingOrders;
        private BigDecimal totalRevenue;
        private BigDecimal todayRevenue;
        private BigDecimal monthlyRevenue;
        private List<DailyRevenueDTO> revenueChart;
        private List<UserGrowthDTO> userGrowthChart;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenueDTO {
        private String date;
        private BigDecimal revenue;
        private Long orders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserGrowthDTO {
        private String date;
        private Long customers;
        private Long shopOwners;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApproveShopRequest {
        @jakarta.validation.constraints.NotNull(message = "Approve action is required")
        private Boolean approve;

        private String rejectionReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManageUserRequest {
        private String action;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopApprovalDTO {
        private Long id;
        private String name;
        private Long ownerId;
        private String ownerName;
        private String ownerEmail;
        private String ownerPhone;
        private String gstNumber;
        private String licenseDocUrl;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportRequest {
        private String reportType;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Long shopId;
        private String format;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueReportDTO {
        private BigDecimal totalRevenue;
        private BigDecimal totalCommission;
        private BigDecimal shopPayouts;
        private Long totalOrders;
        private List<ShopRevenueDTO> shopBreakdown;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopRevenueDTO {
        private Long shopId;
        private String shopName;
        private Long orders;
        private BigDecimal revenue;
        private BigDecimal commission;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBannerRequest {
        private String title;

        @jakarta.validation.constraints.NotBlank(message = "Image URL is required")
        private String imageUrl;

        private String linkUrl;
        private Integer position;
        private LocalDateTime validFrom;
        private LocalDateTime validUntil;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePageRequest {
        @jakarta.validation.constraints.NotBlank(message = "Slug is required")
        private String slug;

        @jakarta.validation.constraints.NotBlank(message = "Title is required")
        private String title;

        @jakarta.validation.constraints.NotBlank(message = "Content is required")
        private String content;

        private Boolean isPublished;
    }
}
