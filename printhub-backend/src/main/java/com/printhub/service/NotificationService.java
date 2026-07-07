package com.printhub.service;

import com.printhub.entity.Order;
import com.printhub.entity.OrderItem;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class NotificationService {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    public void sendOrderPlacedNotification(Order order, java.util.List<OrderItem> items) {
        StringBuilder text = new StringBuilder();
        text.append("New Order Received!\n\n");
        text.append("Order: ").append(order.getOrderNumber()).append("\n");
        text.append("Customer: ").append(order.getUser().getName()).append("\n");
        text.append("Phone: ").append(order.getUser().getPhone()).append("\n");
        text.append("Delivery: ").append(order.getDeliveryType().name()).append("\n");
        text.append("Total: Rs.").append(order.getTotalAmount()).append("\n\n");
        text.append("Items:\n");
        for (OrderItem item : items) {
            text.append("  - ").append(item.getFileName())
                .append(" (").append(item.getPageCount()).append("p x ").append(item.getCopies()).append(" copies)\n");
        }

        sendNtfy("New Order: " + order.getOrderNumber(), text.toString());
    }

    public void sendMessage(String text) {
        sendNtfy("PrintHub Alert", text);
    }

    public void sendOrderStatusUpdate(String orderNumber, String status, String customerName) {
        String text = "Order Update\n\n"
            + "Order: " + orderNumber + "\n"
            + "Status: " + status + "\n"
            + "Customer: " + customerName;

        sendNtfy("Order " + status, text);
    }

    private void sendNtfy(String title, String message) {
        try {
            String json = "{\"topic\":\"xeroxbooking-orders\",\"title\":\"" +
                escapeJson(title) + "\",\"message\":\"" +
                escapeJson(message) + "\",\"tags\":[\"package\"]}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://ntfy.sh"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("ntfy: " + response.statusCode() + " for " + title);
        } catch (Exception e) {
            System.out.println("ntfy: unavailable (" + e.getClass().getSimpleName() + ")");
        }
    }

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
