package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.common.PagedResponse;
import com.printhub.dto.shop.ShopDTOs.*;
import com.printhub.entity.Shop;
import com.printhub.mapper.ShopMapper;
import com.printhub.service.ShopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shops")
@RequiredArgsConstructor
@Tag(name = "Shops", description = "Print shop management APIs")
public class ShopController {

    private final ShopService shopService;

    @GetMapping("/nearby")
    @Operation(summary = "Find nearby shops")
    public ResponseEntity<ApiResponse<List<ShopDTO>>> getNearbyShops(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "10") Double radius,
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(ApiResponse.success(shopService.getNearbyShops(lat, lng, radius, limit)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shop by ID")
    public ResponseEntity<ApiResponse<ShopDTO>> getShopById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(shopService.getShopById(id)));
    }

    @GetMapping("/{id}/details")
    @Operation(summary = "Get shop details with printers and pricing")
    public ResponseEntity<ApiResponse<ShopDetailDTO>> getShopDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(shopService.getShopDetails(id)));
    }

    @PostMapping
    @Operation(summary = "Register a new shop", security = @SecurityRequirement(name = "Bearer Authentication"))
    public ResponseEntity<ApiResponse<ShopDTO>> createShop(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateShopRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Shop registration submitted", shopService.createShop(userId, request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update shop", security = @SecurityRequirement(name = "Bearer Authentication"))
    public ResponseEntity<ApiResponse<ShopDTO>> updateShop(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateShopRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Shop updated", shopService.updateShop(id, userId, request)));
    }

    @PostMapping("/{shopId}/printers")
    @Operation(summary = "Add printer to shop", security = @SecurityRequirement(name = "Bearer Authentication"))
    public ResponseEntity<ApiResponse<PrinterDTO>> addPrinter(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long shopId,
            @Valid @RequestBody CreatePrinterRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Printer added", shopService.addPrinter(shopId, userId, request)));
    }

    @PutMapping("/{shopId}/printers/{printerId}")
    @Operation(summary = "Update printer", security = @SecurityRequirement(name = "Bearer Authentication"))
    public ResponseEntity<ApiResponse<PrinterDTO>> updatePrinter(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long shopId,
            @PathVariable Long printerId,
            @Valid @RequestBody UpdatePrinterRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Printer updated", shopService.updatePrinter(shopId, printerId, userId, request)));
    }

    @PostMapping("/{shopId}/pricing")
    @Operation(summary = "Add pricing rule", security = @SecurityRequirement(name = "Bearer Authentication"))
    public ResponseEntity<ApiResponse<PricingRuleDTO>> addPricingRule(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long shopId,
            @Valid @RequestBody CreatePricingRuleRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Pricing rule added", shopService.addPricingRule(shopId, userId, request)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my shops", security = @SecurityRequirement(name = "Bearer Authentication"))
    public ResponseEntity<ApiResponse<PagedResponse<ShopDTO>>> getMyShops(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = getUserIdFromDetails(userDetails);
        // TODO: Implement proper pagination
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.<ShopDTO>builder()
                .content(shopService.getOwnerShops(userId, pageable).toList())
                .build()));
    }

    private Long getUserIdFromDetails(UserDetails userDetails) {
        // TODO: Extract user ID from JWT claims
        return 1L;
    }
}
