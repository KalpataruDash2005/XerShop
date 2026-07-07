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

    @org.springframework.beans.factory.annotation.Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @org.springframework.beans.factory.annotation.Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @org.springframework.beans.factory.annotation.Value("${twilio.phone-from:}")
    private String twilioPhoneFrom;

    @org.springframework.beans.factory.annotation.Value("${app.admin-whatsapp-numbers}")
    private String adminWhatsappNumbers;

    public void sendWhatsAppDocumentNotification(String orderNumber, java.util.List<OrderItem> items) {
        try {
            String messageText = "New Order Placed: " + orderNumber + "\nDocuments:\n" +
                    items.stream()
                         .map(item -> "- " + item.getFileName() + " (" + item.getPageCount() + " pages)")
                         .collect(java.util.stream.Collectors.joining("\n"));
            sendWhatsAppToAdmins(orderNumber, messageText);
        } catch (Exception e) {
            System.err.println("Failed to trigger WhatsApp notification: " + e.getMessage());
        }
    }

    public void sendOrderPlacedToAdminWhatsApp(Order order, java.util.List<OrderItem> items) {
        StringBuilder message = new StringBuilder();
        message.append(" New Order Received!\n");
        message.append(" Order: ").append(order.getOrderNumber()).append("\n");
        message.append(" Status: PLACED\n");
        message.append(" Customer: ").append(order.getUser().getName()).append("\n");
        message.append(" Phone: ").append(order.getUser().getPhone()).append("\n");
        message.append(" Delivery: ").append(order.getDeliveryType().name()).append("\n");
        message.append(" Total: Rs.").append(order.getTotalAmount()).append("\n");
        message.append(" Items:\n");
        for (OrderItem item : items) {
            message.append("  - ").append(item.getFileName())
                    .append(" (").append(item.getPageCount()).append("p x ").append(item.getCopies()).append(" copies)\n");
        }
        message.append("\n View: ").append("http://localhost:8081/api/v1/admin/orders");
        sendWhatsAppToAdmins(order.getOrderNumber(), message.toString());
    }

    public void sendSms(String toNumber, String messageText) {
        try {
            if (twilioAccountSid == null || twilioAccountSid.trim().isEmpty()) {
                String logMsg = "[SMS SIMULATED to " + toNumber + "] " + messageText;
                System.out.println(logMsg);
                java.nio.file.Files.writeString(
                    java.nio.file.Paths.get("sms_notifications.log"),
                    java.time.LocalDateTime.now() + " " + logMsg + System.lineSeparator(),
                    java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
                return;
            }
            com.twilio.Twilio.init(twilioAccountSid, twilioAuthToken);
            String fromPhone = twilioPhoneFrom.startsWith("+") ? twilioPhoneFrom : "+" + twilioPhoneFrom;
            String toPhone = toNumber.startsWith("+") ? toNumber : "+" + toNumber;
            com.twilio.rest.api.v2010.account.Message.creator(
                    new com.twilio.type.PhoneNumber(toPhone),
                    new com.twilio.type.PhoneNumber(fromPhone),
                    messageText
            ).create();
            System.out.println("SMS sent to " + toNumber);
        } catch (Exception e) {
            System.err.println("Failed to send SMS to " + toNumber + ": " + e.getMessage());
            System.out.println("[SMS FALLBACK to " + toNumber + "] " + messageText);
        }
    }

    private void sendWhatsAppToAdmins(String orderNumber, String messageText) {
        String[] numbers = adminWhatsappNumbers.split(",");
        for (String toNumber : numbers) {
            toNumber = toNumber.trim();
            try {
                if (twilioAccountSid == null || twilioAccountSid.trim().isEmpty()) {
                    String logMsg = "[SIMULATED WHATSAPP to " + toNumber + "] " + messageText.replace("\n", " | ");
                    System.out.println(logMsg);
                    java.nio.file.Files.writeString(
                        java.nio.file.Paths.get("whatsapp_notifications.log"),
                        java.time.LocalDateTime.now() + " " + logMsg + System.lineSeparator(),
                        java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
                    continue;
                }
                com.twilio.Twilio.init(twilioAccountSid, twilioAuthToken);
                String fromPhone = twilioPhoneFrom.startsWith("whatsapp:") ? twilioPhoneFrom : "whatsapp:" + twilioPhoneFrom;
                String toPhone = toNumber.startsWith("whatsapp:") ? toNumber : "whatsapp:" + toNumber;
                com.twilio.rest.api.v2010.account.Message.creator(
                        new com.twilio.type.PhoneNumber(toPhone),
                        new com.twilio.type.PhoneNumber(fromPhone),
                        messageText
                ).create();
                System.out.println("WhatsApp sent to " + toNumber + " for order: " + orderNumber);
            } catch (Exception e) {
                System.err.println("Failed to send WhatsApp to " + toNumber + ": " + e.getMessage());
                System.out.println("[FALLBACK WHATSAPP to " + toNumber + "] " + messageText.replace("\n", " | "));
            }
        }
    }
}
