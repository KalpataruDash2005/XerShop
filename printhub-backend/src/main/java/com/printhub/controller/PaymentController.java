package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.payment.PaymentDTOs.*;
import com.printhub.service.PaymentService;
import com.printhub.service.RazorpayService;
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
@SecurityRequirement(name = "Bearer Authentication")
public class PaymentController {

    private final PaymentService paymentService;
    private final RazorpayService razorpayService;
    private final JwtUtil jwtUtil;

    @PostMapping("/create-order")
    @Operation(summary = "Create a Razorpay order")
    public ResponseEntity<ApiResponse<CreatePaymentOrderResponse>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePaymentOrderRequest request) {
        CreatePaymentOrderResponse response = razorpayService.createOrder(request.getOrderId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment")
    public ResponseEntity<ApiResponse<Void>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VerifyPaymentRequest request) {
        Long userId = jwtUtil.extractUserId(userDetails);
        razorpayService.verifyPayment(userId, request.getOrderId(), request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(), request.getRazorpaySignature());
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", null));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Razorpay webhook handler")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        razorpayService.handleWebhook(payload, signature);
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit manual UPI payment details")
    public ResponseEntity<ApiResponse<PaymentDTO>> submitPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubmitPaymentRequest request) {
        Long userId = jwtUtil.extractUserId(userDetails);
        PaymentDTO response = paymentService.submitPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment submitted for verification", response));
    }
}
