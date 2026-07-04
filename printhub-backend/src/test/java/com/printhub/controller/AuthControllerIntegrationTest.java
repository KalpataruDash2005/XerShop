package com.printhub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.printhub.dto.auth.AuthDTOs;
import com.printhub.entity.User;
import com.printhub.entity.UserRole;
import com.printhub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Clean up before each test
    }

    @Test
    @DisplayName("Should register a new user successfully")
    void register_Success() throws Exception {
        // Given
        AuthDTOs.RegisterRequest request = AuthDTOs.RegisterRequest.builder()
                .name("John Doe")
                .email("john@example.com")
                .phone("+919876543210")
                .password("password12345678")
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.user.name").value("John Doe"))
                .andExpect(jsonPath("$.data.user.phone").value("+919876543210"));
    }

    @Test
    @DisplayName("Should fail registration with invalid email")
    void register_InvalidEmail_BadRequest() throws Exception {
        // Given
        AuthDTOs.RegisterRequest request = AuthDTOs.RegisterRequest.builder()
                .name("John Doe")
                .email("invalid-email")
                .phone("+919876543210")
                .password("password123")
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should fail registration with short password")
    void register_ShortPassword_BadRequest() throws Exception {
        // Given
        AuthDTOs.RegisterRequest request = AuthDTOs.RegisterRequest.builder()
                .name("John Doe")
                .email("john2@example.com")
                .phone("+919876543211")
                .password("short")
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should login successfully after registration")
    void login_Success() throws Exception {
        // Given - First register
        AuthDTOs.RegisterRequest registerRequest = AuthDTOs.RegisterRequest.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .phone("+919876543222")
                .password("password12345678")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // When - Login
        AuthDTOs.LoginRequest loginRequest = AuthDTOs.LoginRequest.builder()
                .identifier("jane@example.com")
                .password("password12345678")
                .build();

        // Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    @Test
    @DisplayName("Should fail login with wrong credentials")
    void login_WrongCredentials_Unauthorized() throws Exception {
        // Given
        AuthDTOs.LoginRequest loginRequest = AuthDTOs.LoginRequest.builder()
                .identifier("nonexistent@example.com")
                .password("wrongpassword")
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }
}
