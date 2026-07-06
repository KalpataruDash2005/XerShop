package com.printhub.service;

import com.printhub.dto.shop.ShopDTOs;
import com.printhub.entity.Shop;
import com.printhub.entity.ShopStatus;
import com.printhub.entity.User;
import com.printhub.entity.UserRole;
import com.printhub.exception.ForbiddenException;
import com.printhub.exception.ResourceNotFoundException;
import com.printhub.mapper.ShopMapper;
import com.printhub.repository.PrinterRepository;
import com.printhub.repository.PricingRuleRepository;
import com.printhub.repository.ReviewRepository;
import com.printhub.repository.ShopRepository;
import com.printhub.repository.UserRepository;
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
class ShopServiceTest {

    @Mock
    private ShopRepository shopRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PrinterRepository printerRepository;

    @Mock
    private PricingRuleRepository pricingRuleRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ShopMapper shopMapper;

    @InjectMocks
    private ShopService shopService;

    private User testUser;
    private Shop testShop;
    private ShopDTOs.CreateShopRequest createRequest;

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
                .owner(testUser)
                .status(ShopStatus.APPROVED)
                .ratingAvg(BigDecimal.valueOf(4.5))
                .totalReviews(10)
                .isAcceptingOrders(true)
                .build();

        createRequest = ShopDTOs.CreateShopRequest.builder()
                .name("New Print Shop")
                .phone("+919876543210")
                .address("123 Main St")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode("400001")
                .build();
    }

    @Test
    @DisplayName("Should get shop by ID successfully")
    void getShopById_Success() {
        // Given
        when(shopRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testShop));
        when(shopMapper.toDTO(any(Shop.class))).thenReturn(ShopDTOs.ShopDTO.builder()
                .id(1L)
                .name("Test Print Shop")
                .build());

        // When
        var result = shopService.getShopById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Print Shop");
    }

    @Test
    @DisplayName("Should throw exception when shop not found")
    void getShopById_NotFound_ThrowsException() {
        // Given
        when(shopRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> shopService.getShopById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should create shop successfully")
    void createShop_Success() {
        // Given
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testUser));
        when(shopMapper.toEntity(any(ShopDTOs.CreateShopRequest.class))).thenReturn(testShop);
        when(shopRepository.save(any(Shop.class))).thenReturn(testShop);
        when(shopMapper.toDTO(any(Shop.class))).thenReturn(ShopDTOs.ShopDTO.builder()
                .id(1L)
                .name("Test Print Shop")
                .build());

        // When
        var result = shopService.createShop(1L, createRequest);

        // Then
        assertThat(result).isNotNull();
        verify(shopRepository).save(any(Shop.class));
    }

    @Test
    @DisplayName("Should update user role to SHOP_OWNER when creating shop")
    void createShop_UpgradeRole_Success() {
        // Given - user is CUSTOMER
        testUser.setRole(UserRole.CUSTOMER);
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testUser));
        when(shopMapper.toEntity(any())).thenReturn(testShop);
        when(shopRepository.save(any())).thenReturn(testShop);
        when(shopMapper.toDTO(any())).thenReturn(mock(ShopDTOs.ShopDTO.class));

        // When
        shopService.createShop(1L, createRequest);

        // Then
        assertThat(testUser.getRole()).isEqualTo(UserRole.SHOP_OWNER);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw forbidden when non-owner tries to update shop")
    void updateShop_NonOwner_ThrowsException() {
        // Given
        User otherUser = User.builder().id(999L).build();
        testShop.setOwner(testUser);

        when(shopRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testShop));

        ShopDTOs.UpdateShopRequest request = ShopDTOs.UpdateShopRequest.builder()
                .name("Updated Name")
                .build();

        // When & Then
        assertThatThrownBy(() -> shopService.updateShop(1L, 999L, request))
                .isInstanceOf(ForbiddenException.class);
    }
}
