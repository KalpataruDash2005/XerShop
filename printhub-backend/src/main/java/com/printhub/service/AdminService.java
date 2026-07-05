package com.printhub.service;

import com.printhub.dto.common.PagedResponse;
import com.printhub.dto.order.OrderDTOs.OrderDTO;
import com.printhub.dto.payment.PaymentDTOs.PaymentDTO;
import com.printhub.entity.Order;
import com.printhub.entity.OrderStatus;
import com.printhub.repository.OrderRepository;
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
}
