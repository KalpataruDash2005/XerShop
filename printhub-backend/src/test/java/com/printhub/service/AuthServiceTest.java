package com.printhub.service;

import com.printhub.dto.auth.AuthDTOs;
import com.printhub.entity.User;
import com.printhub.entity.UserRole;
import com.printhub.repository.RefreshTokenRepository;
import com.printhub.repository.UserRepository;
import com.printhub.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private AuthDTOs.RegisterRequest registerRequest;
    private AuthDTOs.LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .phone("+919876543210")
                .role(UserRole.CUSTOMER)
                .passwordHash("hashedPassword")
                .build();

        registerRequest = AuthDTOs.RegisterRequest.builder()
                .name("Test User")
                .email("test@example.com")
                .phone("+919876543210")
                .password("password123")
                .build();

        loginRequest = AuthDTOs.LoginRequest.builder()
                .identifier("test@example.com")
                .password("password123")
                .build();
    }

    @Test
    @DisplayName("Should register new user successfully")
    void register_Success() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateAccessToken(any())).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any())).thenReturn("refreshToken");
        when(jwtService.getAccessTokenExpiration()).thenReturn(3600000L);

        // When
        var response = authService.register(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("accessToken");
        assertThat(response.getUser().getName()).isEqualTo("Test User");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void register_EmailExists_ThrowsException() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    @DisplayName("Should throw exception when phone already exists")
    void register_PhoneExists_ThrowsException() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Phone number already registered");
    }

    @Test
    @DisplayName("Should login user successfully with email")
    void login_Success() {
        // Given
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(auth.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmailOrPhone(anyString(), anyString()))
                .thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(any(Authentication.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any())).thenReturn("refreshToken");
        when(jwtService.getAccessTokenExpiration()).thenReturn(3600000L);

        // When
        var response = authService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("accessToken");
    }
}
