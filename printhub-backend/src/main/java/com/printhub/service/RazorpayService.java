package com.printhub.service;

import com.printhub.dto.payment.PaymentDTOs.CreatePaymentOrderResponse;
import com.printhub.entity.*;
import com.printhub.exception.BadRequestException;
import com.printhub.repository.OrderRepository;
import com.printhub.repository.PaymentRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RazorpayService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String RAZORPAY_API = "https://api.razorpay.com/v1";

    private HttpHeaders authHeaders() {
        String auth = keyId + ":" + keySecret;
        byte[] encoded = Base64.getEncoder().encode(auth.getBytes());
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + new String(encoded));
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    public CreatePaymentOrderResponse createOrder(Long orderId) {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(orderId)
                .orElseThrow(() -> new BadRequestException("Order not found"));

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Order is not in PLACED status");
        }

        long amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
        String receipt = "rcpt_" + order.getOrderNumber();

        String body = String.format(
                "{\"amount\":%d,\"currency\":\"INR\",\"receipt\":\"%s\",\"payment_capture\":1}",
                amountInPaise, receipt
        );

        try {
            HttpEntity<String> request = new HttpEntity<>(body, authHeaders());
            ResponseEntity<com.printhub.dto.payment.RazorpayOrderResponse> response = restTemplate.exchange(
                    RAZORPAY_API + "/orders",
                    HttpMethod.POST,
                    request,
                    com.printhub.dto.payment.RazorpayOrderResponse.class
            );

            com.printhub.dto.payment.RazorpayOrderResponse razorpayOrder = response.getBody();
            if (razorpayOrder == null || razorpayOrder.getId() == null) {
                throw new BadRequestException("Failed to create Razorpay order");
            }

            Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
            if (payment == null) {
                payment = new Payment();
                payment.setOrder(order);
                payment.setAmount(order.getTotalAmount());
                payment.setCurrency("INR");
                payment.setMethod("RAZORPAY");
            }
            payment.setRazorpayOrderId(razorpayOrder.getId());
            payment.setStatus(PaymentStatus.CREATED);
            paymentRepository.save(payment);

            return CreatePaymentOrderResponse.builder()
                    .orderId(orderId)
                    .razorpayOrderId(razorpayOrder.getId())
                    .amount(amountInPaise)
                    .currency("INR")
                    .keyId(keyId)
                    .build();
        } catch (Exception e) {
            throw new BadRequestException("Razorpay error: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyPayment(Long userId, Long orderId, String razorpayOrderId, String razorpayPaymentId, String signature) {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(orderId)
                .orElseThrow(() -> new BadRequestException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Order already processed");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BadRequestException("Payment not found"));

        if (!razorpayOrderId.equals(payment.getRazorpayOrderId())) {
            throw new BadRequestException("Razorpay order ID mismatch");
        }

        String expectedSignature = hmacSha256(razorpayOrderId + "|" + razorpayPaymentId, keySecret);
        if (!expectedSignature.equals(signature)) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Signature verification failed");
            paymentRepository.save(payment);
            throw new BadRequestException("Payment signature verification failed");
        }

        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(signature);
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.ACCEPTED);
        orderRepository.save(order);
    }

    @Transactional
    public void handleWebhook(String payload, String razorpaySignature) {
        String expectedSignature = hmacSha256(payload, keySecret);
        if (!expectedSignature.equals(razorpaySignature)) {
            throw new BadRequestException("Webhook signature verification failed");
        }
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec spec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
            mac.init(spec);
            byte[] hash = mac.doFinal(data.getBytes());
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC computation failed", e);
        }
    }
}
