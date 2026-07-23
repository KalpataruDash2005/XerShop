package com.printhub.controller;

import com.printhub.dto.address.AddressDTOs.*;
import com.printhub.dto.common.ApiResponse;
import com.printhub.dto.common.PagedResponse;
import com.printhub.dto.user.UserDTOs.*;
import com.printhub.entity.User;
import com.printhub.repository.UserRepository;
import com.printhub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController extends BaseController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(userId)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = getCurrentUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(userId, request)));
    }

    @GetMapping("/me/addresses")
    @Operation(summary = "Get user addresses")
    public ResponseEntity<ApiResponse<Object>> getAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(userService.getAddresses(userId, null)));
    }

    @PostMapping("/me/addresses")
    @Operation(summary = "Add new address")
    public ResponseEntity<ApiResponse<Object>> addAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateAddressRequest request) {
        Long userId = getCurrentUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Address added", userService.addAddress(userId, request)));
    }

    @PutMapping("/me/addresses/{addressId}")
    @Operation(summary = "Update address")
    public ResponseEntity<ApiResponse<Object>> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long addressId,
            @Valid @RequestBody UpdateAddressRequest request) {
        Long userId = getCurrentUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Address updated", userService.updateAddress(userId, addressId, request)));
    }

    @DeleteMapping("/me/addresses/{addressId}")
    @Operation(summary = "Delete address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long addressId) {
        Long userId = getCurrentUserId(userDetails);
        userService.deleteAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }

    @GetMapping("/me/stats")
    @Operation(summary = "Get user statistics")
    public ResponseEntity<ApiResponse<UserStatsDTO>> getUserStats(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(userService.getUserStats(userId)));
    }

    @Override
    protected Long getCurrentUserId(UserDetails userDetails) {
        if (userDetails instanceof com.printhub.security.UserPrincipal) {
            return ((com.printhub.security.UserPrincipal) userDetails).getId();
        }
        try {
            return Long.parseLong(userDetails.getUsername());
        } catch (NumberFormatException e) {
            User user = userRepository.findByPhone(userDetails.getUsername())
                    .or(() -> userRepository.findByEmail(userDetails.getUsername()))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return user.getId();
        }
    }
}
