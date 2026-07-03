package com.printhub.dto.payment;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePaymentOrderRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePaymentOrderResponse {
        private Long orderId;
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
        @NotNull(message = "Order ID is required")
        private Long orderId;

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
    public static class RazorpayWebhookRequest {
        private String event;
        private com.razorpay.PaymentEntity payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefundRequest {
        @NotNull(message = "Payment ID is required")
        private Long paymentId;

        private String reason;
    }
}
