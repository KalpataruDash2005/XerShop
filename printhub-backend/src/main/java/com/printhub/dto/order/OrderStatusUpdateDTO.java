package com.printhub.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO sent over WebSocket to inform clients about order status changes.
 */
@Data
@AllArgsConstructor
public class OrderStatusUpdateDTO {
    private Long orderId;
    private String status; // e.g., "PAYMENT_CONFIRMED", "COMPLETED"
    private String message; // optional human‑readable note
}
