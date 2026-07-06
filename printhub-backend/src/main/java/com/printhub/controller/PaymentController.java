package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.payment.PaymentDTOs.*;
import com.printhub.service.PaymentService;
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
    private final JwtUtil jwtUtil;

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
