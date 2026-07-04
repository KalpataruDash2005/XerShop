package com.printhub.service;

import com.printhub.dto.order.OrderDTOs;
import com.printhub.entity.*;
import com.printhub.exception.BadRequestException;
import com.printhub.exception.ForbiddenException;
import com.printhub.exception.ResourceNotFoundException;
import com.printhub.mapper.OrderMapper;
import com.printhub.repository.*;
import com.printhub.util.OrderNumberGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderTimelineRepository timelineRepository;

    @Mock
    private ShopRepository shopRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PricingRuleRepository pricingRuleRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private OrderNumberGenerator orderNumberGenerator;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Shop testShop;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .phone("+919876543210")
                .role(UserRole.CUSTOMER)
                .build();

        testShop = Shop.builder()
                .id(1L)
                .name("Test Print Shop")
                .status(ShopStatus.APPROVED)
                .isAcceptingOrders(true)
                .owner(User.builder().id(2L).build())
                .build();

        testOrder = Order.builder()
                .id(1L)
                .orderNumber("PH20240101-123456-0001")
                .user(testUser)
                .shop(testShop)
                .status(OrderStatus.PLACED)
                .totalAmount(BigDecimal.valueOf(100))
                .build();
    }

    @Test
    @DisplayName("Should get order by ID successfully")
    void getOrderById_Success() {
        // Given
        when(orderRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testOrder));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of());
        when(timelineRepository.findByOrderIdOrderByCreatedAtAsc(1L)).thenReturn(List.of());
        when(orderMapper.toDTO(any(Order.class))).thenAnswer(inv -> {
            Order order = inv.getArgument(0);
            return OrderDTOs.OrderDTO.builder()
                    .id(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .build();
        });
        when(orderMapper.toItemDTO(any())).thenReturn(mock(OrderDTOs.OrderItemDTO.class));
        when(orderMapper.toTimelineDTO(any())).thenReturn(mock(OrderDTOs.TimelineDTO.class));

        // When
        var result = orderService.getOrderById(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getOrderNumber()).isEqualTo("PH20240101-123456-0001");
    }

    @Test
    @DisplayName("Should throw exception when order not found")
    void getOrderById_NotFound_ThrowsException() {
        // Given
        when(orderRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> orderService.getOrderById(1L, 999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should throw forbidden when user not owner")
    void getOrderById_Forbidden_ThrowsException() {
        // Given
        when(orderRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testOrder));
        // User 999 is not the owner or shop owner

        // When & Then
        assertThatThrownBy(() -> orderService.getOrderById(999L, 1L))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("Should update order status successfully")
    void updateOrderStatus_Success() {
        // Given
        User shopOwner = User.builder().id(2L).name("Shop Owner").build();
        User requester = User.builder().id(2L).build();

        when(orderRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testOrder));
        when(userRepository.findByIdAndDeletedAtIsNull(2L)).thenReturn(Optional.of(requester));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        when(timelineRepository.save(any())).thenReturn(mock(OrderTimeline.class));
        when(orderMapper.toDTO(any(Order.class))).thenReturn(OrderDTOs.OrderDTO.builder().id(1L).build());
        when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of());
        when(timelineRepository.findByOrderIdOrderByCreatedAtAsc(1L)).thenReturn(List.of());

        OrderDTOs.UpdateOrderStatusRequest request = OrderDTOs.UpdateOrderStatusRequest.builder()
                .status("ACCEPTED")
                .notes("Order accepted")
                .build();

        // When
        var result = orderService.updateOrderStatus(1L, 2L, request);

        // Then
        assertThat(result).isNotNull();
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw exception for invalid status transition")
    void updateOrderStatus_InvalidTransition_ThrowsException() {
        // Given
        testOrder.setStatus(OrderStatus.COMPLETED);
        when(orderRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testOrder));
        when(userRepository.findByIdAndDeletedAtIsNull(2L)).thenReturn(Optional.of(User.builder().id(2L).build()));

        OrderDTOs.UpdateOrderStatusRequest request = OrderDTOs.UpdateOrderStatusRequest.builder()
                .status("PRINTING")
                .build();

        // When & Then
        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, 2L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot update status");
    }
}
