package com.printhub.service;

import com.printhub.dto.payment.PaymentDTOs.UpiPayResponse;
import com.printhub.entity.Order;
import com.printhub.entity.OrderStatus;
import com.printhub.exception.BadRequestException;
import com.printhub.exception.ResourceNotFoundException;
import com.printhub.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class UpiPaymentService {

    private final OrderRepository orderRepository;

    @Value("${upi.merchant-vpa}")
    private String merchantVpa;

    @Value("${upi.merchant-name}")
    private String merchantName;

    public UpiPayResponse getUpiPayDetails(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Order is not in a payable state");
        }

        String txnNote = "PRINT" + order.getId() + order.getUser().getId();
        String amountStr = order.getTotalAmount().setScale(2, java.math.RoundingMode.HALF_UP).toString();

        String upiLink = String.format(
            "upi://pay?pa=%s&pn=%s&am=%s&cu=INR&tn=%s",
            urlEncode(merchantVpa),
            urlEncode(merchantName),
            amountStr,
            urlEncode(txnNote)
        );

        return UpiPayResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .amount(order.getTotalAmount())
                .upiId(merchantVpa)
                .upiDeepLink(upiLink)
                .merchantName(merchantName)
                .build();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
