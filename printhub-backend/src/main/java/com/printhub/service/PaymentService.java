package com.printhub.service;

import com.printhub.dto.payment.PaymentDTOs.*;
import com.printhub.entity.*;
import com.printhub.exception.BadRequestException;
import com.printhub.exception.ResourceNotFoundException;
import com.printhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import com.printhub.dto.order.OrderStatusUpdateDTO;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final OrderTimelineRepository timelineRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public PaymentDTO submitPayment(Long userId, SubmitPaymentRequest request) {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Order is not in a payable state");
        }

        if (request.getUtr() != null && !request.getUtr().trim().isEmpty() &&
            paymentRepository.findByUtr(request.getUtr()).isPresent()) {
            throw new BadRequestException("This UTR has already been submitted");
        }

        Payment payment = paymentRepository.findByOrderId(request.getOrderId()).orElse(null);
        if (payment == null) {
            payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(order.getTotalAmount());
            payment.setCurrency("INR");
        } else if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order already paid");
        }

        payment.setUtr(request.getUtr());
        payment.setScreenshotPath(request.getScreenshotPath());
        payment.setContactPhone(request.getContactPhone());
        payment.setMethod("UPI_QR");

        payment.setStatus(PaymentStatus.PENDING_VERIFICATION);

        payment = paymentRepository.save(payment);

        return toDTO(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDTO> getPendingPayments() {
        return paymentRepository.findByStatus(PaymentStatus.PENDING_VERIFICATION)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentDTO approvePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        if (payment.getStatus() != PaymentStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Payment is not in PENDING_VERIFICATION status");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment = paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setStatus(OrderStatus.ACCEPTED);
        orderRepository.save(order);
        addTimelineEntry(order, OrderStatus.ACCEPTED, "Payment approved by admin");
        messagingTemplate.convertAndSend("/topic/orders", new OrderStatusUpdateDTO(order.getId(), "ACCEPTED", "Payment approved by admin"));

        if (order.getWalletAmountUsed() != null && order.getWalletAmountUsed().compareTo(BigDecimal.ZERO) > 0) {
            deductFromWallet(order.getUser().getId(), order.getWalletAmountUsed(), "Payment for order " + order.getOrderNumber(), order);
        }

        return toDTO(payment);
    }

    @Transactional
    public PaymentDTO rejectPayment(Long paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        if (payment.getStatus() != PaymentStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Payment is not in PENDING_VERIFICATION status");
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason != null ? reason : "Rejected by admin");
        payment = paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setStatus(OrderStatus.REJECTED);
        orderRepository.save(order);
        String rejectReason = reason != null ? reason : "Rejected by admin";
        addTimelineEntry(order, OrderStatus.REJECTED, rejectReason);
        messagingTemplate.convertAndSend("/topic/orders", new OrderStatusUpdateDTO(order.getId(), "REJECTED", rejectReason));

        return toDTO(payment);
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

    private void addTimelineEntry(Order order, OrderStatus status, String notes) {
        OrderTimeline timeline = OrderTimeline.builder()
                .order(order)
                .status(status)
                .notes(notes)
                .build();
        timelineRepository.save(timeline);
    }

    private PaymentDTO toDTO(Payment payment) {
        User user = payment.getOrder().getUser();
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
                .utr(payment.getUtr())
                .screenshotPath(payment.getScreenshotPath())
                .userName(user.getName())
                .userPhone(user.getPhone())
                .contactPhone(payment.getContactPhone())
                .build();
    }
}
