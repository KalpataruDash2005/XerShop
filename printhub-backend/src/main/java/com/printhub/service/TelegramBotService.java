package com.printhub.service;

import com.printhub.entity.Order;
import com.printhub.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class TelegramBotService {

    private final FileStorageService fileStorageService;

    @Value("${telegram.bot-token:}")
    private String botToken;

    @Value("${telegram.chat-id:}")
    private String chatId;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    public void sendOrderPlacedNotification(Order order, java.util.List<OrderItem> items) {
        StringBuilder text = new StringBuilder();
        text.append("<b>New Order Received!</b>\n\n");
        text.append("Order: <b>").append(order.getOrderNumber()).append("</b>\n");
        text.append("Status: PLACED\n");
        text.append("Customer: ").append(order.getUser().getName()).append("\n");
        text.append("Phone: ").append(order.getUser().getPhone()).append("\n");
        text.append("Delivery: ").append(order.getDeliveryType().name()).append("\n");
        text.append("Total: Rs.").append(order.getTotalAmount()).append("\n\n");
        text.append("Items:\n");
        for (OrderItem item : items) {
            text.append("  - ").append(item.getFileName())
                .append(" (").append(item.getPageCount()).append("p x ").append(item.getCopies()).append(" copies)\n");
        }

        String message = text.toString();
        if (!botToken.isBlank() && !chatId.isBlank()) {
            sendTelegram(message);
        }
        sendNtfy("New Order: " + order.getOrderNumber(), "Rs." + order.getTotalAmount() + " - " + order.getUser().getName());
    }

    public void sendMessage(String text) {
        if (!botToken.isBlank() && !chatId.isBlank()) {
            sendTelegram(text);
        }
        sendNtfy("PrintHub Alert", text);
    }

    public void sendOrderStatusUpdate(String orderNumber, String status, String customerName) {
        String text = "<b>Order Update</b>\n\n"
            + "Order: " + orderNumber + "\n"
            + "Status: " + status + "\n"
            + "Customer: " + customerName;

        if (!botToken.isBlank() && !chatId.isBlank()) {
            sendTelegram(text);
        }
        sendNtfy("Order " + status, orderNumber + " - " + customerName);
    }

    private void sendTelegram(String text) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
            String json = "{\"chat_id\":\"" + chatId + "\",\"text\":\"" +
                escapeJson(text) + "\",\"parse_mode\":\"HTML\"}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Telegram: " + response.statusCode() + " for order " + (response.statusCode() == 200 ? "OK" : response.body()));
        } catch (Exception e) {
            System.out.println("Telegram: unavailable (" + e.getClass().getSimpleName() + ")");
        }
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
