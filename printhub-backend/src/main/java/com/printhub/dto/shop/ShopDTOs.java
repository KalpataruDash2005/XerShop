package com.printhub.dto.shop;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ShopDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopDTO {
        private Long id;
        private Long ownerId;
        private String ownerName;
        private String name;
        private String description;
        private String gstNumber;
        private String phone;
        private String email;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String logoUrl;
        private String status;
        private BigDecimal commissionPercent;
        private BigDecimal ratingAvg;
        private Integer totalReviews;
        private Boolean isAcceptingOrders;
        private String operatingHours;
        private Double distanceKm;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateShopRequest {
        @NotBlank(message = "Shop name is required")
        @Size(max = 150, message = "Name must not exceed 150 characters")
        private String name;

        private String description;

        @Size(max = 20, message = "GST number must not exceed 20 characters")
        private String gstNumber;

        private String licenseDocUrl;

        @NotBlank(message = "Phone is required")
        private String phone;

        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "Pincode is required")
        private String pincode;

        private BigDecimal latitude;
        private BigDecimal longitude;
        private String logoUrl;
        private String operatingHours;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateShopRequest {
        private String name;
        private String description;
        private String phone;
        private String email;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String logoUrl;
        private String operatingHours;
        private Boolean isAcceptingOrders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopDetailDTO {
        private ShopDTO shop;
        private List<PrinterDTO> printers;
        private List<PricingRuleDTO> pricingRules;
        private List<ReviewDTO> recentReviews;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrinterDTO {
        private Long id;
        private String name;
        private String model;
        private String type;
        private String status;
        private String maxPaperSize;
        private Boolean supportsColor;
        private Boolean supportsDuplex;
        private Integer maxGsm;
        private Integer printsPerMinute;
        private Integer totalPrints;
        private LocalDateTime lastMaintenanceAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePrinterRequest {
        @NotBlank(message = "Printer name is required")
        private String name;

        private String model;

        @NotBlank(message = "Printer type is required")
        private String type;

        private String maxPaperSize;
        private Boolean supportsColor;
        private Boolean supportsDuplex;
        private Integer maxGsm;
        private Integer printsPerMinute;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePrinterRequest {
        private String name;
        private String model;
        private String status;
        private String maxPaperSize;
        private Boolean supportsColor;
        private Boolean supportsDuplex;
        private Integer maxGsm;
        private Integer printsPerMinute;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingRuleDTO {
        private Long id;
        private String paperSize;
        private Integer gsm;
        private String colorMode;
        private String sides;
        private String binding;
        private BigDecimal basePrice;
        private BigDecimal pricePerPage;
        private BigDecimal pricePerCopy;
        private BigDecimal laminationPrice;
        private BigDecimal bindingPrice;
        private Integer minPages;
        private Boolean isActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePricingRuleRequest {
        private String paperSize;
        private Integer gsm;
        private String colorMode;
        private String sides;
        private String binding;

        @NotNull(message = "Base price is required")
        private BigDecimal basePrice;

        private BigDecimal pricePerPage;
        private BigDecimal pricePerCopy;
        private BigDecimal laminationPrice;
        private BigDecimal bindingPrice;
        private Integer minPages;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NearbyShopsRequest {
        @NotNull(message = "Latitude is required")
        private BigDecimal latitude;

        @NotNull(message = "Longitude is required")
        private BigDecimal longitude;

        @DecimalMin(value = "0.1", message = "Radius must be at least 0.1 km")
        @DecimalMax(value = "50.0", message = "Radius must not exceed 50 km")
        @Builder.Default
        private Double radiusKm = 10.0;

        @Builder.Default
        private Integer limit = 20;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewDTO {
        private Long id;
        private Long orderId;
        private Long userId;
        private String userName;
        private Integer rating;
        private String comment;
        private List<String> images;
        private String shopResponse;
        private LocalDateTime createdAt;
    }
}
