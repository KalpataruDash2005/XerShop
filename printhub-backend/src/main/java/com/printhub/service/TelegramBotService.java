package com.printhub.service;

import com.printhub.entity.Order;
import com.printhub.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TelegramBotService {

    private final RestTemplate restTemplate;
    private final FileStorageService fileStorageService;

    @Value("${telegram.bot-token:}")
    private String botToken;

    @Value("${telegram.chat-id:}")
    private String chatId;

    public void sendOrderPlacedNotification(Order order, List<OrderItem> items) {
        if (botToken.isBlank() || chatId.isBlank()) {
            System.out.println("[TELEGRAM SIMULATED] Bot token or chat ID not configured");
            return;
        }

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

        sendMessage(text.toString());

        // Send each uploaded file as a document
        for (OrderItem item : items) {
            if (item.getFileUrl() != null && !item.getFileUrl().isBlank()) {
                sendDocument(item.getFileUrl(), item.getFileName());
            }
        }
    }

    public void sendOrderStatusUpdate(String orderNumber, String status, String customerName) {
        if (botToken.isBlank() || chatId.isBlank()) return;

        String text = "<b>Order Update</b>\n\n"
            + "Order: " + orderNumber + "\n"
            + "Status: " + status + "\n"
            + "Customer: " + customerName;

        sendMessage(text);
    }

    private void sendMessage(String text) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
            Map<String, String> body = Map.of(
                "chat_id", chatId,
                "text", text,
                "parse_mode", "HTML"
            );
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, entity, String.class);
            System.out.println("Telegram notification sent for order");
        } catch (Exception e) {
            System.err.println("Failed to send Telegram notification: " + e.getMessage());
        }
    }

    private void sendDocument(String fileUrl, String fileName) {
        try {
            String storedName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            org.springframework.core.io.Resource fileResource = fileStorageService.loadFileAsResource(storedName);

            String url = "https://api.telegram.org/bot" + botToken + "/sendDocument";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("chat_id", chatId);
            body.add("document", new FileSystemResource(fileResource.getFile()));
            body.add("caption", fileName);

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, entity, String.class);
            System.out.println("Telegram document sent: " + fileName);
        } catch (Exception e) {
            System.err.println("Failed to send Telegram document " + fileName + ": " + e.getMessage());
        }
    }
}
