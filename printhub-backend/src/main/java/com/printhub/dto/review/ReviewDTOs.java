package com.printhub.dto.review;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ReviewDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewDTO {
        private Long id;
        private Long orderId;
        private Long userId;
        private String userName;
        private Long shopId;
        private String shopName;
        private Integer rating;
        private String comment;
        private List<String> images;
        private String shopResponse;
        private LocalDateTime shopResponseAt;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReviewRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must not exceed 5")
        private Integer rating;

        @Size(max = 1000, message = "Comment must not exceed 1000 characters")
        private String comment;

        private List<String> images;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateReviewRequest {
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must not exceed 5")
        private Integer rating;

        @Size(max = 1000, message = "Comment must not exceed 1000 characters")
        private String comment;

        private List<String> images;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopResponseRequest {
        @NotBlank(message = "Response is required")
        @Size(max = 500, message = "Response must not exceed 500 characters")
        private String response;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewStatsDTO {
        private BigDecimal averageRating;
        private Long totalReviews;
        private Long fiveStars;
        private Long fourStars;
        private Long threeStars;
        private Long twoStars;
        private Long oneStars;
    }
}
