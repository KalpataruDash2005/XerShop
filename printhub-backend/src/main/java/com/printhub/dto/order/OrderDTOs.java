package com.printhub.dto.order;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDTO {
        private Long id;
        private String orderNumber;
        private Long userId;
        private Long shopId;
        private String shopName;
        private String status;
        private String deliveryType;
        private AddressDTO deliveryAddress;
        private BigDecimal subtotal;
        private BigDecimal discount;
        private BigDecimal tax;
        private BigDecimal deliveryCharge;
        private BigDecimal totalAmount;
        private String couponCode;
        private BigDecimal walletAmountUsed;
        private String notes;
        private String rejectionReason;
        private LocalDateTime estimatedCompletionAt;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private List<OrderItemDTO> items;
        private List<TimelineDTO> timeline;
        private String userName;
        private String userPhone;
        private String screenshotPath;
        private String paymentStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private Long id;
        private String fileUrl;
        private String fileName;
        private String fileType;
        private Integer pageCount;
        private Integer copies;
        private String colorMode;
        private String sides;
        private String paperSize;
        private Integer gsm;
        private String binding;
        private Boolean lamination;
        private String pageRange;
        private BigDecimal lineTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineDTO {
        private Long id;
        private String status;
        private String notes;
        private String changedByName;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDTO {
        private String label;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String pincode;
        private BigDecimal latitude;
        private BigDecimal longitude;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        @NotNull(message = "Shop ID is required")
        private Long shopId;

        @NotBlank(message = "Delivery type is required")
        private String deliveryType;

        private Long addressId;

        @NotNull(message = "Items are required")
        @Size(min = 1, message = "At least one item is required")
        private List<CreateOrderItemRequest> items;

        private String couponCode;
        private BigDecimal walletAmountUsed;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderItemRequest {
        private String fileUrl;

        @NotBlank(message = "File name is required")
        private String fileName;

        private String fileType;

        @NotNull(message = "Page count is required")
        @Min(value = 1, message = "At least 1 page required")
        private Integer pageCount;

        @NotNull(message = "Copies is required")
        @Min(value = 1, message = "At least 1 copy required")
        private Integer copies;

        @NotBlank(message = "Color mode is required")
        private String colorMode;

        @NotBlank(message = "Print sides is required")
        private String sides;

        private String paperSize;
        private Integer gsm;
        private String binding;
        private Boolean lamination;
        private String pageRange;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateOrderStatusRequest {
        @NotBlank(message = "Status is required")
        private String status;

        private String notes;
        private String rejectionReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceEstimateRequest {
        @NotNull(message = "Shop ID is required")
        private Long shopId;

        @NotNull(message = "Items are required")
        private List<OrderItemSpec> items;

        private String couponCode;
        private BigDecimal walletAmountUsed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemSpec {
        private Integer pageCount;
        private Integer copies;
        private String colorMode;
        private String sides;
        private String paperSize;
        private Integer gsm;
        private String binding;
        private Boolean lamination;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceEstimateResponse {
        private BigDecimal subtotal;
        private BigDecimal discount;
        private BigDecimal tax;
        private BigDecimal deliveryCharge;
        private BigDecimal walletDiscount;
        private BigDecimal totalAmount;
        private String couponApplied;
        private BigDecimal couponDiscount;
        private List<ItemPriceBreakdown> itemBreakdowns;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemPriceBreakdown {
        private Integer pageCount;
        private Integer copies;
        private String colorMode;
        private String paperSize;
        private BigDecimal basePrice;
        private BigDecimal printingCost;
        private BigDecimal bindingCost;
        private BigDecimal laminationCost;
        private BigDecimal lineTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderListFilter {
        private String status;
        private String deliveryType;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Long shopId;
    }
}
