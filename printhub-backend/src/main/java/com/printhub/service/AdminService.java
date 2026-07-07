package com.printhub.service;

import com.printhub.dto.admin.AdminDTOs.PastOrderSummary;
import com.printhub.dto.common.PagedResponse;
import com.printhub.dto.order.OrderDTOs.OrderDTO;
import com.printhub.dto.payment.PaymentDTOs.PaymentDTO;
import com.printhub.entity.Order;
import com.printhub.entity.OrderItem;
import com.printhub.entity.OrderStatus;
import com.printhub.repository.OrderItemRepository;
import com.printhub.repository.OrderRepository;
import com.printhub.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderService.getAllOrdersForAdmin(pageable);
    }

    @Transactional(readOnly = true)
    public List<PaymentDTO> getPendingPayments() {
        return paymentService.getPendingPayments();
    }

    public PaymentDTO approvePayment(Long id) {
        return paymentService.approvePayment(id);
    }

    public PaymentDTO rejectPayment(Long id, String reason) {
        return paymentService.rejectPayment(id, reason);
    }

    @Transactional(readOnly = true)
    public List<PastOrderSummary> getPastOrders() {
        List<Order> completedOrders = orderRepository.findByStatusOrderByCompletedAtDesc(OrderStatus.COMPLETED);
        return completedOrders.stream().map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            int totalPages = items.stream().mapToInt(i -> i.getPageCount() * i.getCopies()).sum();
            int totalCopies = items.stream().mapToInt(OrderItem::getCopies).sum();

            String paymentStatus = "N/A";
            String paymentMethod = "N/A";
            String utr = "N/A";
            var paymentOpt = paymentRepository.findByOrderId(order.getId());
            if (paymentOpt.isPresent()) {
                var p = paymentOpt.get();
                paymentStatus = p.getStatus() != null ? p.getStatus().name() : "N/A";
                paymentMethod = p.getMethod() != null ? p.getMethod() : "N/A";
                utr = p.getUtr() != null ? p.getUtr() : "N/A";
            }

            return PastOrderSummary.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .userName(order.getUser().getName())
                    .userPhone(order.getUser().getPhone())
                    .totalPages(totalPages)
                    .totalCopies(totalCopies)
                    .totalAmount(order.getTotalAmount())
                    .paymentStatus(paymentStatus)
                    .paymentMethod(paymentMethod)
                    .utr(utr)
                    .completedAt(order.getCompletedAt())
                    .createdAt(order.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }
}
