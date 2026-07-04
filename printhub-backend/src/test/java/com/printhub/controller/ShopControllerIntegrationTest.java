package com.printhub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.printhub.dto.shop.ShopDTOs;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShopControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should return nearby shops")
    void getNearbyShops_Success() throws Exception {
        // Given - coordinates for Mumbai
        BigDecimal lat = new BigDecimal("19.0760");
        BigDecimal lng = new BigDecimal("72.8777");

        // When & Then
        mockMvc.perform(get("/api/v1/shops/nearby")
                        .param("lat", lat.toString())
                        .param("lng", lng.toString())
                        .param("radius", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should require authentication to create shop")
    void createShop_Unauthorized() throws Exception {
        // Given
        ShopDTOs.CreateShopRequest request = ShopDTOs.CreateShopRequest.builder()
                .name("Test Shop")
                .phone("+919876543210")
                .address("123 Main St")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode("400001")
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/shops")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
