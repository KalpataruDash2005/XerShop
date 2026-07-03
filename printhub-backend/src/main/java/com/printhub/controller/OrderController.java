package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.common.PagedResponse;
import com.printhub.dto.order.OrderDTOs.*;
import com.printhub.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/price-estimate")
    @Operation(summary = "Calculate price estimate")
    public ResponseEntity<ApiResponse<PriceEstimateResponse>> calculatePriceEstimate(
            @Valid @RequestBody PriceEstimateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(orderService.calculatePriceEstimate(request)));
    }

    @PostMapping
    @Operation(summary = "Create a new order")
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Order created", orderService.createOrder(userId, request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(userId, id)));
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get order by order number")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByNumber(orderNumber)));
    }

    @GetMapping
    @Operation(summary = "Get user orders")
    public ResponseEntity<ApiResponse<PagedResponse<OrderDTO>>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = getUserIdFromDetails(userDetails);
        Page<OrderDTO> orders = orderService.getUserOrders(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(orders)));
    }

    @GetMapping("/shop/{shopId}")
    @Operation(summary = "Get shop orders")
    public ResponseEntity<ApiResponse<PagedResponse<OrderDTO>>> getShopOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long shopId,
            Pageable pageable) {
        Long userId = getUserIdFromDetails(userDetails);
        Page<OrderDTO> orders = orderService.getShopOrders(shopId, userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(orders)));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", orderService.updateOrderStatus(id, userId, request)));
    }

    @PostMapping("/{id}/reorder")
    @Operation(summary = "Reorder a previous order")
    public ResponseEntity<ApiResponse<OrderDTO>> reorder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Order recreated", orderService.reorder(userId, id)));
    }

    @GetMapping("/{id}/invoice")
    @Operation(summary = "Download order invoice")
    public ResponseEntity<byte[]> downloadInvoice(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        // TODO: Implement invoice generation
        return ResponseEntity.notFound().build();
    }

    private Long getUserIdFromDetails(UserDetails userDetails) {
        // TODO: Extract user ID from JWT claims
        return 1L;
    }
}
