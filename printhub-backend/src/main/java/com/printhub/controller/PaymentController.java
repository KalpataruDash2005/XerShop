package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.payment.PaymentDTOs.*;
import com.printhub.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    @Operation(summary = "Create Razorpay order")
    public ResponseEntity<ApiResponse<CreatePaymentOrderResponse>> createPaymentOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePaymentOrderRequest request) throws Exception {
        Long userId = getUserIdFromDetails(userDetails);
        CreatePaymentOrderResponse response = paymentService.createPaymentOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify and confirm payment")
    public ResponseEntity<ApiResponse<PaymentDTO>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VerifyPaymentRequest request) throws Exception {
        Long userId = getUserIdFromDetails(userDetails);
        PaymentDTO response = paymentService.verifyAndConfirmPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified", response));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Razorpay webhook handler", security = {})
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) throws Exception {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromDetails(UserDetails userDetails) {
        // TODO: Extract user ID from JWT claims
        return 1L;
    }
}
