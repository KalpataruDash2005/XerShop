package com.printhub.controller;

import com.printhub.dto.address.AddressDTOs.*;
import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.common.PagedResponse;
import com.printhub.dto.user.UserDTOs.*;
import com.printhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(userId)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(userId, request)));
    }

    @GetMapping("/me/addresses")
    @Operation(summary = "Get user addresses")
    public ResponseEntity<ApiResponse<Object>> getAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success(userService.getAddresses(userId, null)));
    }

    @PostMapping("/me/addresses")
    @Operation(summary = "Add new address")
    public ResponseEntity<ApiResponse<Object>> addAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateAddressRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Address added", userService.addAddress(userId, request)));
    }

    @PutMapping("/me/addresses/{addressId}")
    @Operation(summary = "Update address")
    public ResponseEntity<ApiResponse<Object>> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long addressId,
            @Valid @RequestBody UpdateAddressRequest request) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Address updated", userService.updateAddress(userId, addressId, request)));
    }

    @DeleteMapping("/me/addresses/{addressId}")
    @Operation(summary = "Delete address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long addressId) {
        Long userId = getUserIdFromDetails(userDetails);
        userService.deleteAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }

    @GetMapping("/me/stats")
    @Operation(summary = "Get user statistics")
    public ResponseEntity<ApiResponse<UserStatsDTO>> getUserStats(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromDetails(userDetails);
        return ResponseEntity.ok(ApiResponse.success(userService.getUserStats(userId)));
    }

    private Long getUserIdFromDetails(UserDetails userDetails) {
        // TODO: Extract user ID from JWT claims or fetch from database
        // For now, return a placeholder - in real implementation, you'd get this from JWT
        return 1L;
    }
}
