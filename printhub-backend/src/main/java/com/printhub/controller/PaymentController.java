package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.payment.PaymentDTOs.*;
import com.printhub.service.PaymentService;
import com.printhub.service.UpiPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.printhub.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management APIs")
public class PaymentController {

    private final PaymentService paymentService;
    private final UpiPaymentService upiPaymentService;
    private final JwtUtil jwtUtil;

    @PostMapping("/create-order")
    @Operation(summary = "Create a Razorpay payment order before creating the actual order")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<CreatePaymentOrderResponse>> createPaymentOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePaymentOrderRequest request) {
        Long userId = jwtUtil.extractUserId(userDetails);
        CreatePaymentOrderResponse response = paymentService.createPaymentOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment order created", response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment and create the order")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<VerifyPaymentResponse>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VerifyPaymentRequest request) {
        Long userId = jwtUtil.extractUserId(userDetails);
        VerifyPaymentResponse response = paymentService.verifyPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", response));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Razorpay webhook endpoint")
    public ResponseEntity<ApiResponse<Void>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        paymentService.processWebhook(payload, signature);
        return ResponseEntity.ok(ApiResponse.success("Webhook processed", null));
    }

    @GetMapping("/upi-pay/{orderId}")
    @Operation(summary = "Get UPI pay details for an order")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<UpiPayResponse>> getUpiPayDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        Long userId = jwtUtil.extractUserId(userDetails);
        UpiPayResponse response = upiPaymentService.getUpiPayDetails(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success("UPI pay details generated", response));
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit manual UPI payment details")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<PaymentDTO>> submitPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubmitPaymentRequest request) {
        Long userId = jwtUtil.extractUserId(userDetails);
        PaymentDTO response = paymentService.submitPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment submitted for verification", response));
    }
}
