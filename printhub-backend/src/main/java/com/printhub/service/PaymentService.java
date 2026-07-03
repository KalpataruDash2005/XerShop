package com.printhub.service;

import com.printhub.dto.payment.PaymentDTOs.*;
import com.printhub.entity.*;
import com.printhub.exception.BadRequestException;
import com.printhub.exception.ResourceNotFoundException;
import com.printhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import org.json.JSONObject;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    private com.razorpay.RazorpayClient razorpayClient;

    private com.razorpay.RazorpayClient getRazorpayClient() throws Exception {
        if (razorpayClient == null) {
            razorpayClient = new com.razorpay.RazorpayClient(razorpayKeyId, razorpayKeySecret);
        }
        return razorpayClient;
    }

    @Transactional
    public CreatePaymentOrderResponse createPaymentOrder(Long userId, CreatePaymentOrderRequest request) throws Exception {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Order is not in a payable state");
        }

        Payment existingPayment = paymentRepository.findByOrderId(request.getOrderId()).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order already paid");
        }

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", order.getTotalAmount().multiply(BigDecimal.valueOf(100)).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", order.getOrderNumber());
        orderRequest.put("payment_capture", 1);

        com.razorpay.Order razorpayOrder = getRazorpayClient().orders.create(orderRequest);

        Payment payment = Payment.builder()
                .order(order)
                .razorpayOrderId(razorpayOrder.get("id"))
                .amount(order.getTotalAmount())
                .status(PaymentStatus.CREATED)
                .build();
        paymentRepository.save(payment);

        return CreatePaymentOrderResponse.builder()
                .orderId(order.getId())
                .razorpayOrderId(razorpayOrder.get("id"))
                .amount(order.getTotalAmount())
                .currency("INR")
                .keyId(razorpayKeyId)
                .build();
    }

    @Transactional
    public PaymentDTO verifyAndConfirmPayment(Long userId, VerifyPaymentRequest request) throws Exception {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "order", String.valueOf(request.getOrderId())));

        if (!payment.getRazorpayOrderId().equals(request.getRazorpayOrderId())) {
            throw new BadRequestException("Invalid Razorpay order ID");
        }

        boolean isValid = verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValid) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BadRequestException("Payment signature verification failed");
        }

        com.razorpay.Payment razorpayPayment = getRazorpayClient().payments.fetch(request.getRazorpayPaymentId());

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setMethod(razorpayPayment.get("method"));
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.ACCEPTED);
        orderRepository.save(order);

        if (order.getWalletAmountUsed() != null && order.getWalletAmountUsed().compareTo(BigDecimal.ZERO) > 0) {
            deductFromWallet(userId, order.getWalletAmountUsed(), "Payment for order " + order.getOrderNumber(), order);
        }

        return toDTO(payment);
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            javax.crypto.spec.SecretKeySpec keySpec = new javax.crypto.spec.SecretKeySpec(
                    razorpayKeySecret.getBytes(), "HmacSHA256");
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(keySpec);
            byte[] result = mac.doFinal(data.getBytes());
            String generatedSignature = java.util.Base64.getEncoder().encodeToString(result);
            return generatedSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public void handleWebhook(String payload, String signature) throws Exception {
        JSONObject payloadJson = new JSONObject(payload);
        String event = payloadJson.getString("event");

        if ("payment.authorized".equals(event) || "payment.captured".equals(event)) {
            JSONObject payment = payloadJson.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String razorpayOrderId = payment.getJSONObject("order_id") != null ?
                    payment.getString("order_id") : null;

            if (razorpayOrderId != null) {
                Payment paymentRecord = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
                if (paymentRecord != null && paymentRecord.getStatus() == PaymentStatus.CREATED) {
                    paymentRecord.setStatus(PaymentStatus.SUCCESS);
                    paymentRecord.setRazorpayPaymentId(payment.getString("id"));
                    paymentRepository.save(paymentRecord);

                    Order order = paymentRecord.getOrder();
                    order.setStatus(OrderStatus.ACCEPTED);
                    orderRepository.save(order);
                }
            }
        } else if ("payment.failed".equals(event)) {
            JSONObject payment = payloadJson.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String razorpayOrderId = payment.getString("order_id");

            Payment paymentRecord = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
            if (paymentRecord != null) {
                paymentRecord.setStatus(PaymentStatus.FAILED);
                paymentRecord.setFailureReason(payment.optString("error_description"));
                paymentRepository.save(paymentRecord);
            }
        } else if ("refund.created".equals(event) || "refund.processed".equals(event)) {
            JSONObject refund = payloadJson.getJSONObject("payload").getJSONObject("refund").getJSONObject("entity");
            JSONObject payment = refund.getJSONObject("payment_id") != null ?
                    payloadJson.getJSONObject("payload").getJSONObject("order") : null;
        }
    }

    private void deductFromWallet(Long userId, BigDecimal amount, String description, Order order) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", userId));

        wallet.setBalance(wallet.getBalance().subtract(amount));
        wallet.setTotalSpent(wallet.getTotalSpent().add(amount));
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .type(TransactionType.DEBIT)
                .amount(amount)
                .balanceAfter(wallet.getBalance())
                .description(description)
                .order(order)
                .build();
        walletTransactionRepository.save(transaction);
    }

    private PaymentDTO toDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .status(payment.getStatus().name())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .method(payment.getMethod())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
