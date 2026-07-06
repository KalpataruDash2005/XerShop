package com.printhub.service;

import com.printhub.dto.order.OrderDTOs.*;
import com.printhub.entity.*;
import com.printhub.exception.BadRequestException;
import com.printhub.exception.ForbiddenException;
import com.printhub.exception.ResourceNotFoundException;
import com.printhub.mapper.OrderMapper;
import com.printhub.repository.*;
import com.printhub.util.OrderNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final TelegramBotService telegramBotService;
    private final PaymentRepository paymentRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderTimelineRepository timelineRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final WalletRepository walletRepository;
    private final OrderMapper orderMapper;
    private final OrderNumberGenerator orderNumberGenerator;
    private final SimpMessagingTemplate messagingTemplate;

    public PriceEstimateResponse calculatePriceEstimate(PriceEstimateRequest request) {
        boolean couponValid = false;
        String couponApplied = null;
        if (request.getCouponCode() != null) {
            Coupon coupon = couponRepository.findByCodeAndDeletedAtIsNull(request.getCouponCode()).orElse(null);
            if (coupon != null && coupon.getIsActive()) {
                couponValid = true;
                couponApplied = coupon.getCode();
            }
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<ItemPriceBreakdown> breakdowns = new java.util.ArrayList<>();

        for (OrderItemSpec item : request.getItems()) {
            ItemPriceBreakdown breakdown = calculateItemPrice(item, couponValid);
            breakdowns.add(breakdown);
            subtotal = subtotal.add(breakdown.getLineTotal());
        }

        BigDecimal walletDiscount = BigDecimal.ZERO;
        if (request.getWalletAmountUsed() != null && request.getWalletAmountUsed().compareTo(BigDecimal.ZERO) > 0) {
            walletDiscount = request.getWalletAmountUsed();
        }

        BigDecimal totalAmount = subtotal.subtract(walletDiscount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        return PriceEstimateResponse.builder()
                .subtotal(subtotal)
                .discount(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .deliveryCharge(BigDecimal.ZERO)
                .walletDiscount(walletDiscount)
                .totalAmount(totalAmount)
                .couponApplied(couponApplied)
                .itemBreakdowns(breakdowns)
                .build();
    }

    private ItemPriceBreakdown calculateItemPrice(OrderItemSpec item, boolean couponActive) {
        BigDecimal pricePerPage = couponActive ? BigDecimal.ONE : BigDecimal.valueOf(2);
        int totalPages = item.getPageCount() * item.getCopies();
        BigDecimal printingCost = pricePerPage.multiply(BigDecimal.valueOf(totalPages));

        BigDecimal bindingCost = BigDecimal.ZERO;
        if (item.getBinding() != null && !item.getBinding().equals("NONE")) {
            bindingCost = BigDecimal.valueOf(30);
        }

        BigDecimal laminationCost = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(item.getLamination())) {
            laminationCost = BigDecimal.valueOf(5).multiply(BigDecimal.valueOf(item.getPageCount()));
        }

        BigDecimal lineTotal = printingCost.add(bindingCost).add(laminationCost);

        return ItemPriceBreakdown.builder()
                .pageCount(item.getPageCount())
                .copies(item.getCopies())
                .colorMode(item.getColorMode())
                .paperSize(item.getPaperSize())
                .basePrice(pricePerPage)
                .printingCost(printingCost)
                .bindingCost(bindingCost)
                .laminationCost(laminationCost)
                .lineTotal(lineTotal)
                .build();
    }

    @Transactional
    public OrderDTO createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Long targetShopId = 1L;
        Shop shop = shopRepository.findByIdAndDeletedAtIsNull(targetShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", targetShopId));

        if (shop.getStatus() != ShopStatus.APPROVED) {
            throw new BadRequestException("Shop is not accepting orders");
        }

        if (!shop.getIsAcceptingOrders()) {
            throw new BadRequestException("Shop is temporarily not accepting orders");
        }

        Address deliveryAddress = null;
        if (request.getDeliveryType().equals("DELIVERY")) {
            if (request.getAddressId() == null) {
                throw new BadRequestException("Delivery address is required for delivery orders");
            }
            deliveryAddress = addressRepository.findByIdAndUserIdAndDeletedAtIsNull(request.getAddressId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Address", request.getAddressId()));
        }

        Order order = Order.builder()
                .orderNumber(orderNumberGenerator.generate())
                .user(user)
                .shop(shop)
                .status(OrderStatus.PLACED)
                .deliveryType(DeliveryType.valueOf(request.getDeliveryType()))
                .deliveryAddress(deliveryAddress)
                .notes(request.getNotes())
                .build();

        // Calculate pricing with flat rate
        boolean couponValid = false;
        if (request.getCouponCode() != null) {
            Coupon coupon = couponRepository.findByCodeAndDeletedAtIsNull(request.getCouponCode()).orElse(null);
            if (coupon != null && Boolean.TRUE.equals(coupon.getIsActive())) {
                couponValid = true;
                order.setCoupon(coupon);
            }
        }

        Order finalOrder = order;
        final boolean finalCouponValid = couponValid;
        List<OrderItem> items = request.getItems().stream()
                .map(itemRequest -> {
                    OrderItem item = orderMapper.toEntity(itemRequest);
                    item.setOrder(finalOrder);
                    ItemPriceBreakdown breakdown = calculateItemPrice(new OrderItemSpec(
                            item.getPageCount(), item.getCopies(), item.getColorMode().name(),
                            item.getSides().name(), item.getPaperSize(), item.getGsm(),
                            item.getBinding() != null ? item.getBinding().name() : null, item.getLamination()
                    ), finalCouponValid);
                    item.setLineTotal(breakdown.getLineTotal());
                    return item;
                })
                .collect(Collectors.toList());

        order.setItems(items);

        // Calculate totals
        BigDecimal subtotal = items.stream()
                .map(OrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal walletUsed = request.getWalletAmountUsed() != null ? request.getWalletAmountUsed() : BigDecimal.ZERO;
        order.setWalletAmountUsed(walletUsed);

        BigDecimal total = subtotal.subtract(walletUsed);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
            order.setWalletAmountUsed(subtotal);
        }

        order.setSubtotal(subtotal);
        order.setDiscount(BigDecimal.ZERO);
        order.setTax(BigDecimal.ZERO);
        order.setTotalAmount(total);

        order = orderRepository.save(order);

        // Save items
        List<OrderItem> savedItems = orderItemRepository.saveAll(items);
        order.setItems(savedItems);

        // Trigger WhatsApp notification to admins with full order details
        try {
            notificationService.sendOrderPlacedToAdminWhatsApp(order, savedItems);
        } catch (Exception e) {
            System.err.println("Failed to trigger WhatsApp notification: " + e.getMessage());
        }

        // Trigger Telegram notification
        try {
            telegramBotService.sendOrderPlacedNotification(order, savedItems);
        } catch (Exception e) {
            System.err.println("Failed to trigger Telegram notification: " + e.getMessage());
        }

        // Add timeline entry
        addTimelineEntry(order, OrderStatus.PLACED, "Order placed", user);

        return orderMapper.toDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        User requester = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        boolean isUser = order.getUser().getId().equals(userId);
        boolean isOwner = order.getShop().getOwner().getId().equals(userId);
        boolean isAdmin = requester.getRole() == UserRole.ADMIN;

        if (!isUser && !isOwner && !isAdmin) {
            throw new ForbiddenException("Access denied");
        }

        return enrichOrderDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumberAndDeletedAtIsNull(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "order number", orderNumber));
        return enrichOrderDTO(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getUserOrders(Long userId, Pageable pageable) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        if (user.getRole() == UserRole.ADMIN) {
            return orderRepository.findByDeletedAtIsNullOrderByCreatedAtDesc(pageable)
                    .map(this::enrichOrderDTO);
        } else if (user.getRole() == UserRole.SHOP_OWNER) {
            List<com.printhub.entity.Shop> shops = shopRepository.findByOwnerIdAndDeletedAtIsNull(userId);
            if (!shops.isEmpty()) {
                List<Long> shopIds = shops.stream().map(com.printhub.entity.Shop::getId).collect(Collectors.toList());
                return orderRepository.findByShopIdInAndDeletedAtIsNullOrderByCreatedAtDesc(shopIds, pageable)
                        .map(this::enrichOrderDTO);
            }
            return org.springframework.data.domain.Page.empty();
        }
        
        return orderRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId, pageable)
                .map(this::enrichOrderDTO);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrdersForAdmin(Pageable pageable) {
        return orderRepository.findByDeletedAtIsNullOrderByCreatedAtDesc(pageable)
                .map(this::enrichOrderDTO);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getShopOrders(Long shopId, Long requesterId, Pageable pageable) {
        Shop shop = shopRepository.findByIdAndDeletedAtIsNull(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", shopId));

        if (!shop.getOwner().getId().equals(requesterId)) {
            User requester = userRepository.findByIdAndDeletedAtIsNull(requesterId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", requesterId));
            if (requester.getRole() != UserRole.ADMIN) {
                throw new ForbiddenException("Access denied");
            }
        }

        return orderRepository.findByShopIdAndDeletedAtIsNullOrderByCreatedAtDesc(shopId, pageable)
                .map(this::enrichOrderDTO);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, Long requesterId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        User requester = userRepository.findByIdAndDeletedAtIsNull(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", requesterId));

        if (!order.getShop().getOwner().getId().equals(requesterId) && requester.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Only shop owner or admin can update order status");
        }

        OrderStatus newStatus = OrderStatus.valueOf(request.getStatus());
        validateStatusTransition(order.getStatus(), newStatus, request);

        order.setStatus(newStatus);

        if (newStatus == OrderStatus.REJECTED && request.getRejectionReason() != null) {
            order.setRejectionReason(request.getRejectionReason());
        }

        if (newStatus == OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
        }

        order = orderRepository.save(order);
        addTimelineEntry(order, newStatus, request.getNotes(), requester);
        // Broadcast the status update to subscribed clients
        messagingTemplate.convertAndSend("/topic/orders", new com.printhub.dto.order.OrderStatusUpdateDTO(order.getId(), newStatus.name(), request.getNotes()));

        return enrichOrderDTO(order);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next, UpdateOrderStatusRequest request) {
        if (current == OrderStatus.COMPLETED || current == OrderStatus.CANCELLED || current == OrderStatus.REJECTED) {
            throw new BadRequestException("Cannot update status of a " + current.name().toLowerCase() + " order");
        }

        if (next == OrderStatus.REJECTED && (request.getRejectionReason() == null || request.getRejectionReason().isBlank())) {
            throw new BadRequestException("Rejection reason is required");
        }

        // Valid transitions based on business flow
        boolean validTransition = switch (current) {
            case PLACED -> next == OrderStatus.ACCEPTED || next == OrderStatus.REJECTED || next == OrderStatus.CANCELLED;
            case ACCEPTED -> next == OrderStatus.PRINTING || next == OrderStatus.REJECTED || next == OrderStatus.CANCELLED;
            case PRINTING -> next == OrderStatus.READY;
            case READY -> next == OrderStatus.OUT_FOR_DELIVERY || next == OrderStatus.COMPLETED;
            case OUT_FOR_DELIVERY -> next == OrderStatus.COMPLETED;
            default -> false;
        };

        if (!validTransition) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + next);
        }
    }

    private void addTimelineEntry(Order order, OrderStatus status, String notes, User changedBy) {
        OrderTimeline timeline = OrderTimeline.builder()
                .order(order)
                .status(status)
                .notes(notes)
                .changedBy(changedBy)
                .build();
        timelineRepository.save(timeline);
    }

    private OrderDTO enrichOrderDTO(Order order) {
        OrderDTO dto = orderMapper.toDTO(order);

        List<OrderItemDTO> itemDTOs = orderItemRepository.findByOrderId(order.getId())
                .stream()
                .map(orderMapper::toItemDTO)
                .collect(Collectors.toList());
        dto.setItems(itemDTOs);

        List<TimelineDTO> timelineDTOs = timelineRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())
                .stream()
                .map(orderMapper::toTimelineDTO)
                .collect(Collectors.toList());
        dto.setTimeline(timelineDTOs);

        dto.setUserName(order.getUser().getName());
        dto.setUserPhone(order.getUser().getPhone());

        paymentRepository.findByOrderId(order.getId())
                .ifPresent(payment -> {
                    dto.setScreenshotPath(payment.getScreenshotPath());
                    dto.setPaymentStatus(payment.getStatus().name());
                });

        return dto;
    }

    @Transactional
    public OrderDTO reorder(Long userId, Long orderId) {
        Order original = orderRepository.findByIdAndDeletedAtIsNull(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!original.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        CreateOrderRequest request = CreateOrderRequest.builder()
                .shopId(original.getShop().getId())
                .deliveryType(original.getDeliveryType().name())
                .addressId(original.getDeliveryAddress() != null ? original.getDeliveryAddress().getId() : null)
                .notes(original.getNotes())
                .items(original.getItems().stream()
                        .map(item -> CreateOrderItemRequest.builder()
                                .fileUrl(item.getFileUrl())
                                .fileName(item.getFileName())
                                .fileType(item.getFileType())
                                .pageCount(item.getPageCount())
                                .copies(item.getCopies())
                                .colorMode(item.getColorMode().name())
                                .sides(item.getSides().name())
                                .paperSize(item.getPaperSize())
                                .gsm(item.getGsm())
                                .binding(item.getBinding() != null ? item.getBinding().name() : null)
                                .lamination(item.getLamination())
                                .pageRange(item.getPageRange())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        recreateOrderForReorder(request, original);
        return createOrder(userId, request);
    }

    private void recreateOrderForReorder(CreateOrderRequest request, Order original) {
        // For reorder, we use the same files from the original order
        // In production, we might want to copy/validate files still exist
    }
}
