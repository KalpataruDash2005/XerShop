package com.printhub.service;

import com.printhub.dto.notification.NotificationDTOs;
import com.printhub.entity.*;
import com.printhub.mapper.NotificationMapper;
import com.printhub.repository.NotificationRepository;
import com.printhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    public Page<NotificationDTOs.NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toDTO);
    }

    public NotificationDTOs.UnreadCountDTO getUnreadCount(Long userId) {
        long count = notificationRepository.countUnreadByUserId(userId);
        return NotificationDTOs.UnreadCountDTO.builder().unreadCount(count).build();
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getId().equals(userId))
                .ifPresent(n -> notificationRepository.markAsRead(notificationId));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void sendOrderStatusNotification(Order order, OrderStatus newStatus) {
        String title = getOrderStatusTitle(newStatus);
        String message = getOrderStatusMessage(newStatus, order.getOrderNumber());

        createNotification(order.getUser(), title, message, "ORDER_STATUS", "ORDER", order.getId());

        // Also notify shop owner for certain statuses
        if (newStatus == OrderStatus.PLACED) {
            createNotification(order.getShop().getOwner(), "New Order", "New order " + order.getOrderNumber() + " received", "NEW_ORDER", "ORDER", order.getId());
        }
    }

    @Transactional
    public void sendUserNotification(Long userId, String title, String message, String type) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId).orElse(null);
        if (user != null) {
            createNotification(user, title, message, type, null, null);
        }
    }

    private void createNotification(User user, String title, String message, String type, String referenceType, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);
    }

    private String getOrderStatusTitle(OrderStatus status) {
        return switch (status) {
            case PLACED -> "Order Placed";
            case ACCEPTED -> "Order Accepted";
            case REJECTED -> "Order Rejected";
            case PRINTING -> "Printing Started";
            case READY -> "Order Ready";
            case OUT_FOR_DELIVERY -> "Out for Delivery";
            case COMPLETED -> "Order Completed";
            case CANCELLED -> "Order Cancelled";
        };
    }

    private String getOrderStatusMessage(OrderStatus status, String orderNumber) {
        return switch (status) {
            case PLACED -> "Your order " + orderNumber + " has been placed successfully.";
            case ACCEPTED -> "Your order " + orderNumber + " has been accepted by the shop.";
            case REJECTED -> "Your order " + orderNumber + " has been rejected.";
            case PRINTING -> "Your order " + orderNumber + " is being printed.";
            case READY -> "Your order " + orderNumber + " is ready for collection.";
            case OUT_FOR_DELIVERY -> "Your order " + orderNumber + " is out for delivery.";
            case COMPLETED -> "Your order " + orderNumber + " has been completed. Thank you!";
            case CANCELLED -> "Your order " + orderNumber + " has been cancelled.";
        };
    }
}
