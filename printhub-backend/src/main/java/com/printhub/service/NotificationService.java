package com.printhub.service;

import com.printhub.entity.Order;
import com.printhub.entity.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class NotificationService {

    @Value("${APP_BASE_URL:}")
    private String baseUrl;

    @Value("${TELEGRAM_BOT_TOKEN:}")
    private String telegramBotToken;

    @Value("${TELEGRAM_CHAT_ID:}")
    private String telegramChatId;

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
        text.append("Files:\n");
        String firstFileUrl = null;
        for (OrderItem item : items) {
            String fileUrl = item.getFileUrl();
            if (fileUrl != null && !fileUrl.isEmpty()) {
                if (firstFileUrl == null) {
                    firstFileUrl = fileUrl.startsWith("http") ? fileUrl : baseUrl + "/api/v1/files/" + fileUrl;
                }
                text.append("  - ").append(item.getFileName())
                    .append(" (").append(item.getPageCount()).append("p x ").append(item.getCopies()).append(" copies)\n");
            }
        }

        sendNtfy("New Order: " + order.getOrderNumber(), text.toString(), firstFileUrl);
        sendTelegram(text.toString());
    }

    public void sendMessage(String text) {
        sendNtfy("PrintHub Alert", text);
        sendTelegram(text);
    }

    public void sendOrderStatusUpdate(String orderNumber, String status, String customerName) {
        String text = "Order Update\n\n"
            + "Order: " + orderNumber + "\n"
            + "Status: " + status + "\n"
            + "Customer: " + customerName;

        sendNtfy("Order " + status, text);
        sendTelegram(text);
    }

    private void sendTelegram(String message) {
        if (telegramBotToken == null || telegramBotToken.isEmpty() || telegramChatId == null || telegramChatId.isEmpty()) {
            return;
        }
        try {
            String escaped = message.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replaceAll("[\\x00-\\x1f\\x7f]", "");
            String body = "{\"chat_id\":\"" + telegramChatId + "\",\"text\":\"" + escaped + "\",\"parse_mode\":\"HTML\"}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.telegram.org/bot" + telegramBotToken + "/sendMessage"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("telegram: " + response.statusCode() + " for notification");
        } catch (Exception e) {
            System.out.println("telegram: unavailable (" + e.getClass().getSimpleName() + ")");
        }
    }

    private void sendNtfy(String title, String message) {
        sendNtfy(title, message, null);
    }

    private void sendNtfy(String title, String message, String clickUrl) {
        try {
            StringBuilder json = new StringBuilder();
            json.append("{\"topic\":\"xeroxbooking-orders\",\"title\":\"")
                .append(escapeJson(title))
                .append("\",\"message\":\"")
                .append(escapeJson(message))
                .append("\",\"tags\":[\"package\"]");
            if (clickUrl != null) {
                json.append(",\"click\":\"").append(escapeJson(clickUrl)).append("\"");
            }
            json.append("}");

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://ntfy.sh"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString(json.toString()))
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
