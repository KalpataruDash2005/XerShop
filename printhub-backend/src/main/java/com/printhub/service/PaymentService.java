package com.printhub.service;

import com.printhub.dto.payment.PaymentDTOs.*;
import com.printhub.dto.order.OrderDTOs.*;
import com.printhub.dto.order.OrderDTOs.OrderItemSpec;
import com.printhub.entity.*;
import com.printhub.exception.BadRequestException;
import com.printhub.exception.ResourceNotFoundException;
import com.printhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private final BankStatementService bankStatementService;
    private final OrderTimelineRepository timelineRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RazorpayService razorpayService;
    private final OrderService orderService;
    private final UserRepository userRepository;

    @Transactional
    public PaymentDTO submitPayment(Long userId, SubmitPaymentRequest request) {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PLACED) {
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
        } else if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order already paid");
        }

        payment.setUtr(request.getUtr());
        payment.setScreenshotPath(request.getScreenshotPath());
        payment.setContactPhone(request.getContactPhone());
        payment.setMethod("UPI_QR");

        boolean isCredited = bankStatementService.verifyTransaction(order.getTotalAmount());
        if (isCredited) {
            payment.setStatus(PaymentStatus.PAID);
            order.setStatus(OrderStatus.ACCEPTED);
            orderRepository.save(order);
            addTimelineEntry(order, OrderStatus.ACCEPTED, "Payment auto-verified via bank statement");
            messagingTemplate.convertAndSend("/topic/orders", new OrderStatusUpdateDTO(order.getId(), "ACCEPTED", "Payment auto-verified"));
            if (order.getWalletAmountUsed() != null && order.getWalletAmountUsed().compareTo(BigDecimal.ZERO) > 0) {
                deductFromWallet(order.getUser().getId(), order.getWalletAmountUsed(), "Payment for order " + order.getOrderNumber(), order);
            }
        } else {
            payment.setStatus(PaymentStatus.PENDING_VERIFICATION);
        }

        payment = paymentRepository.save(payment);

        return toDTO(payment);
    }

    @Transactional
    public CreatePaymentOrderResponse createPaymentOrder(Long userId, CreatePaymentOrderRequest request) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        BigDecimal totalAmount = calculateTotalFromItems(request);
        // Override with estimate from OrderService for accurate coupon/pricing logic
        try {
            PriceEstimateRequest estimateReq = PriceEstimateRequest.builder()
                    .shopId(request.getShopId())
                    .items(request.getItems().stream()
                            .map(i -> OrderItemSpec.builder()
                                    .pageCount(i.getPageCount())
                                    .copies(i.getCopies())
                                    .colorMode(i.getColorMode())
                                    .sides(i.getSides())
                                    .paperSize(i.getPaperSize())
                                    .gsm(i.getGsm())
                                    .binding(i.getBinding())
                                    .lamination(i.getLamination())
                                    .build())
                            .collect(java.util.stream.Collectors.toList()))
                    .couponCode(request.getCouponCode())
                    .walletAmountUsed(request.getWalletAmountUsed())
                    .envelopePackaging(request.getEnvelopePackaging())
                    .build();
            totalAmount = orderService.calculatePriceEstimate(estimateReq).getTotalAmount();
        } catch (Exception e) {
            // fallback to rough estimate
        }
        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Invalid payment amount");
        }

        CreateOrderRequest orderRequest = buildCreateOrderRequest(request);
        String preOrderData = orderService.serializeOrderRequest(orderRequest);

        Payment payment = Payment.builder()
                .amount(totalAmount)
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .method("RAZORPAY")
                .gateway("RAZORPAY")
                .preOrderData(preOrderData)
                .build();
        payment = paymentRepository.save(payment);

        String receipt = "PAY" + payment.getId() + "U" + userId;
        int amountInPaise = totalAmount.multiply(BigDecimal.valueOf(100)).intValue();

        String razorpayOrderId;
        try {
            razorpayOrderId = razorpayService.createOrder(amountInPaise, "INR", receipt);
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Razorpay order creation failed: " + e.getMessage());
            paymentRepository.save(payment);
            throw new BadRequestException("Payment gateway error. Please try again.");
        }

        payment.setRazorpayOrderId(razorpayOrderId);
        paymentRepository.save(payment);

        return CreatePaymentOrderResponse.builder()
                .paymentId(payment.getId())
                .razorpayOrderId(razorpayOrderId)
                .amount(totalAmount)
                .currency("INR")
                .keyId(razorpayService.getKeyId())
                .build();
    }

    @Transactional
    public VerifyPaymentResponse verifyPayment(Long userId, VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", request.getPaymentId()));

        if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.SUCCESS) {
            if (payment.getOrder() != null) {
                return VerifyPaymentResponse.builder()
                        .paymentId(payment.getId())
                        .orderId(payment.getOrder().getId())
                        .orderNumber(payment.getOrder().getOrderNumber())
                        .status("ALREADY_PAID")
                        .amount(payment.getAmount())
                        .build();
            }
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Payment is not in a payable state");
        }

        if (!request.getRazorpayOrderId().equals(payment.getRazorpayOrderId())) {
            throw new BadRequestException("Razorpay order ID mismatch");
        }

        payment.setStatus(PaymentStatus.PROCESSING);
        paymentRepository.save(payment);

        boolean signatureValid = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!signatureValid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Invalid payment signature");
            paymentRepository.save(payment);
            throw new BadRequestException("Payment verification failed");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());

        try {
            CreateOrderRequest orderRequest = orderService.deserializeOrderRequest(payment.getPreOrderData());
            Order order = orderService.createOrderEntity(userId, orderRequest);

            payment.setOrder(order);
            payment.setStatus(PaymentStatus.PAID);
            payment.setInvoiceNumber("INV-" + order.getOrderNumber());
            paymentRepository.save(payment);

            if (order.getWalletAmountUsed() != null && order.getWalletAmountUsed().compareTo(BigDecimal.ZERO) > 0) {
                deductFromWallet(userId, order.getWalletAmountUsed(), "Payment for order " + order.getOrderNumber(), order);
            }

            messagingTemplate.convertAndSend("/topic/orders",
                new OrderStatusUpdateDTO(order.getId(), "PENDING", "Payment successful, order placed"));

            return VerifyPaymentResponse.builder()
                    .paymentId(payment.getId())
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .status("PAID")
                    .amount(payment.getAmount())
                    .build();
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Order creation failed: " + e.getMessage());
            paymentRepository.save(payment);
            throw new BadRequestException("Order creation failed after payment. Please contact support.");
        }
    }

    @Transactional
    public void processWebhook(String payload, String signatureHeader) {
        if (!razorpayService.verifyWebhookSignature(payload, signatureHeader)) {
            throw new BadRequestException("Invalid webhook signature");
        }

        com.google.gson.JsonObject event;
        try {
            event = com.google.gson.JsonParser.parseString(payload).getAsJsonObject();
        } catch (Exception e) {
            throw new BadRequestException("Invalid webhook payload");
        }

        String eventType = event.get("event").getAsString();

        if (!"payment.captured".equals(eventType) && !"order.paid".equals(eventType)) {
            return;
        }

        String razorpayOrderId = "";
        String razorpayPaymentId = "";
        try {
            if (event.has("payload") && event.get("payload").getAsJsonObject().has("payment")) {
                var paymentObj = event.get("payload").getAsJsonObject().get("payment").getAsJsonObject().get("entity").getAsJsonObject();
                razorpayOrderId = paymentObj.get("order_id").getAsString();
                razorpayPaymentId = paymentObj.get("id").getAsString();
            } else if (event.has("payload") && event.get("payload").getAsJsonObject().has("order")) {
                var orderObj = event.get("payload").getAsJsonObject().get("order").getAsJsonObject().get("entity").getAsJsonObject();
                razorpayOrderId = orderObj.get("id").getAsString();
                razorpayPaymentId = orderObj.has("payment_id") ? orderObj.get("payment_id").getAsString() : "";
            }
        } catch (Exception e) {
            return;
        }

        if (razorpayOrderId.isEmpty()) return;

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
        if (payment == null) return;

        if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.SUCCESS) return;

        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setStatus(PaymentStatus.PAID);

        if (payment.getOrder() == null && payment.getPreOrderData() != null) {
            try {
                CreateOrderRequest orderRequest = orderService.deserializeOrderRequest(payment.getPreOrderData());
                User user = payment.getOrder() != null ? payment.getOrder().getUser() : null;
                if (user == null) {
                    user = userRepository.findByIdAndDeletedAtIsNull(1L)
                            .orElse(null);
                }
                if (user != null) {
                    Order order = orderService.createOrderEntity(user.getId(), orderRequest);
                    payment.setOrder(order);
                    payment.setInvoiceNumber("INV-" + order.getOrderNumber());
                }
            } catch (Exception e) {
                payment.setFailureReason("Webhook order creation failed: " + e.getMessage());
            }
        }

        paymentRepository.save(payment);
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

        payment.setStatus(PaymentStatus.PAID);
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

    private BigDecimal calculateTotalFromItems(CreatePaymentOrderRequest request) {

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemPayload item : request.getItems()) {
            BigDecimal pricePerPage = "COLOR".equalsIgnoreCase(item.getColorMode()) ? BigDecimal.valueOf(5) : BigDecimal.valueOf(2);
            int totalPages = item.getPageCount() * item.getCopies();
            BigDecimal printingCost = pricePerPage.multiply(BigDecimal.valueOf(totalPages));

            BigDecimal bindingCost = BigDecimal.ZERO;
            if (item.getBinding() != null) {
                switch (item.getBinding()) {
                    case "SPIRAL": bindingCost = BigDecimal.valueOf(45); break;
                    case "SOFT":
                    case "SOFT_BINDING": bindingCost = BigDecimal.valueOf(40); break;
                }
            }

            BigDecimal laminationCost = BigDecimal.ZERO;
            if (Boolean.TRUE.equals(item.getLamination())) {
                laminationCost = BigDecimal.valueOf(5).multiply(BigDecimal.valueOf(item.getPageCount()));
            }

            subtotal = subtotal.add(printingCost).add(bindingCost).add(laminationCost);
        }

        BigDecimal walletUsed = request.getWalletAmountUsed() != null ? request.getWalletAmountUsed() : BigDecimal.ZERO;
        BigDecimal handlingFee = Boolean.TRUE.equals(request.getEnvelopePackaging()) ? BigDecimal.valueOf(8) : BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(walletUsed).add(handlingFee);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;
        return total;
    }

    private CreateOrderRequest buildCreateOrderRequest(CreatePaymentOrderRequest request) {
        return CreateOrderRequest.builder()
                .shopId(request.getShopId())
                .deliveryType(request.getDeliveryType())
                .addressId(request.getAddressId())
                .notes(request.getNotes())
                .couponCode(request.getCouponCode())
                .walletAmountUsed(request.getWalletAmountUsed())
                .envelopePackaging(request.getEnvelopePackaging())
                .items(request.getItems().stream()
                        .map(item -> com.printhub.dto.order.OrderDTOs.CreateOrderItemRequest.builder()
                                .fileUrl(item.getFileUrl())
                                .fileName(item.getFileName())
                                .fileType(item.getFileType())
                                .pageCount(item.getPageCount())
                                .copies(item.getCopies())
                                .colorMode(item.getColorMode())
                                .sides(item.getSides())
                                .paperSize(item.getPaperSize())
                                .gsm(item.getGsm())
                                .binding(item.getBinding())
                                .lamination(item.getLamination())
                                .pageRange(item.getPageRange())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private PaymentDTO toDTO(Payment payment) {
        PaymentDTO.PaymentDTOBuilder builder = PaymentDTO.builder()
                .id(payment.getId())
                .status(payment.getStatus().name())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .method(payment.getMethod())
                .gateway(payment.getGateway())
                .invoiceNumber(payment.getInvoiceNumber())
                .createdAt(payment.getCreatedAt())
                .utr(payment.getUtr())
                .screenshotPath(payment.getScreenshotPath())
                .contactPhone(payment.getContactPhone());

        if (payment.getOrder() != null) {
            builder.orderId(payment.getOrder().getId());
            User user = payment.getOrder().getUser();
            builder.userName(user.getName());
            builder.userPhone(user.getPhone());
        }

        return builder.build();
    }
}
