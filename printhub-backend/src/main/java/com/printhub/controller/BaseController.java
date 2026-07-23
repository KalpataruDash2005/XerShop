package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

public abstract class BaseController {

    protected Long getCurrentUserId(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal) {
            return ((UserPrincipal) userDetails).getId();
        }
        throw new IllegalArgumentException("UserDetails is not a UserPrincipal. Cannot extract user ID.");
    }

    protected <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    protected <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity.ok(ApiResponse.success(message, data));
    }

    protected ResponseEntity<ApiResponse<Void>> ok() {
        return ResponseEntity.ok(ApiResponse.success("Success", null));
    }
}