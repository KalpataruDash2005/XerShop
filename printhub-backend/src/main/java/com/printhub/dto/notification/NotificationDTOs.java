package com.printhub.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class NotificationDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationDTO {
        private Long id;
        private String title;
        private String message;
        private String type;
        private String referenceType;
        private Long referenceId;
        private Boolean isRead;
        private LocalDateTime readAt;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnreadCountDTO {
        private Long unreadCount;
    }
}
