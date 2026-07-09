package com.printhub.dto.payment;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PaymentDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDTO {
        private Long id;
        private Long orderId;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String status;
        private BigDecimal amount;
        private String currency;
        private String method;
        private String gateway;
        private String invoiceNumber;
        private LocalDateTime createdAt;
        private String utr;
        private String screenshotPath;
        private String userName;
        private String userPhone;
        private String contactPhone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitPaymentRequest {
        @jakarta.validation.constraints.NotNull(message = "Order ID is required")
        private Long orderId;

        @jakarta.validation.constraints.NotBlank(message = "UTR number is required")
        private String utr;

        private String screenshotPath;

        private String contactPhone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpiPayResponse {
        private Long orderId;
        private String orderNumber;
        private BigDecimal amount;
        private String upiId;
        private String upiDeepLink;
        private String merchantName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePaymentOrderRequest {
        @NotNull(message = "Shop ID is required")
        private Long shopId;

        @NotBlank(message = "Delivery type is required")
        private String deliveryType;

        private Long addressId;

        @NotNull(message = "Items are required")
        @Size(min = 1, message = "At least one item is required")
        private List<OrderItemPayload> items;

        private String couponCode;
        private BigDecimal walletAmountUsed;
        private String notes;
        private Boolean envelopePackaging;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemPayload {
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
    public static class CreatePaymentOrderResponse {
        private Long paymentId;
        private String razorpayOrderId;
        private BigDecimal amount;
        private String currency;
        private String keyId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyPaymentRequest {
        @NotNull(message = "Payment ID is required")
        private Long paymentId;

        @NotBlank(message = "Razorpay order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Signature is required")
        private String razorpaySignature;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyPaymentResponse {
        private Long paymentId;
        private Long orderId;
        private String orderNumber;
        private String status;
        private BigDecimal amount;
    }
}
