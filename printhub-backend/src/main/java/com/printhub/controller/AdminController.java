package com.printhub.controller;

import com.printhub.dto.admin.AdminDTOs.PastOrderSummary;
import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.common.PagedResponse;
import com.printhub.dto.order.OrderDTOs.OrderDTO;
import com.printhub.dto.order.OrderDTOs.UpdateOrderStatusRequest;
import com.printhub.dto.payment.PaymentDTOs.PaymentDTO;
import com.printhub.service.AdminService;
import com.printhub.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin", description = "Admin management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController extends BaseController {

    private final AdminService adminService;
    private final OrderService orderService;

    public AdminController(AdminService adminService, OrderService orderService) {
        this.adminService = adminService;
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all orders on the platform")
    public ResponseEntity<ApiResponse<PagedResponse<OrderDTO>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OrderDTO> ordersPage = adminService.getAllOrders(PageRequest.of(page, size));
        PagedResponse<OrderDTO> result = PagedResponse.of(ordersPage);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/ping")
    @Operation(summary = "Ping test")
    public ResponseEntity<ApiResponse<String>> ping() {
        return ResponseEntity.ok(ApiResponse.<String>success("pong"));
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update status of an order")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Long requesterId = getCurrentUserId(userDetails);
        OrderDTO orderDTO = orderService.updateOrderStatus(id, requesterId, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", orderDTO));
    }

    @GetMapping("/payments/pending")
    @Operation(summary = "Get all pending-verification payments")
    public ResponseEntity<ApiResponse<List<PaymentDTO>>> getPendingPayments() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPendingPayments()));
    }

    @PostMapping("/payments/{id}/approve")
    @Operation(summary = "Approve pending payment")
    public ResponseEntity<ApiResponse<PaymentDTO>> approvePayment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment approved", adminService.approvePayment(id)));
    }

    @PostMapping("/payments/{id}/reject")
    @Operation(summary = "Reject pending payment")
    public ResponseEntity<ApiResponse<PaymentDTO>> rejectPayment(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success("Payment rejected", adminService.rejectPayment(id, reason)));
    }

    @GetMapping("/orders/past")
    @Operation(summary = "Get completed/delivered orders for accounts")
    public ResponseEntity<ApiResponse<List<PastOrderSummary>>> getPastOrders() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPastOrders()));
    }

    @DeleteMapping("/orders/{id}")
    @Operation(summary = "Admin delete an order (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        orderService.adminDeleteOrder(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Order deleted by admin", null));
    }
}
