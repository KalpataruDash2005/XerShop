package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.payment.PaymentDTOs.*;
import com.printhub.service.PaymentService;
import com.printhub.service.UpiPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments", description = "Payment management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class PaymentController extends BaseController {

    private final PaymentService paymentService;
    private final UpiPaymentService upiPaymentService;

    public PaymentController(PaymentService paymentService, UpiPaymentService upiPaymentService) {
        this.paymentService = paymentService;
        this.upiPaymentService = upiPaymentService;
    }

    @GetMapping("/upi-pay/{orderId}")
    @Operation(summary = "Get UPI pay details for an order")
    public ResponseEntity<ApiResponse<UpiPayResponse>> getUpiPayDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        Long userId = getCurrentUserId(userDetails);
        UpiPayResponse response = upiPaymentService.getUpiPayDetails(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success("UPI pay details generated", response));
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit manual UPI payment details")
    public ResponseEntity<ApiResponse<PaymentDTO>> submitPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubmitPaymentRequest request) {
        Long userId = getCurrentUserId(userDetails);
        PaymentDTO response = paymentService.submitPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment submitted for verification", response));
    }
}
