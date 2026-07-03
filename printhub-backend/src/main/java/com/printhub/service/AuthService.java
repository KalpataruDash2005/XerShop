package com.printhub.service;

import com.printhub.dto.auth.AuthDTOs.*;
import com.printhub.entity.RefreshToken;
import com.printhub.entity.User;
import com.printhub.entity.UserRole;
import com.printhub.exception.BadRequestException;
import com.printhub.exception.ConflictException;
import com.printhub.exception.UnauthorizedException;
import com.printhub.repository.RefreshTokenRepository;
import com.printhub.repository.UserRepository;
import com.printhub.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if user already exists
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CUSTOMER)
                .isVerified(false)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(new UserPrincipal(user));
        String refreshToken = generateRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(toUserSummary(user))
                .build();
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getIdentifier(),
                        request.getPassword()
                )
        );

        User user = getUserFromAuthentication(authentication);

        String accessToken = jwtService.generateAccessToken(authentication);
        String refreshToken = generateRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(toUserSummary(user))
                .build();
    }

    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String tokenHash = jwtService.generateTokenHash(request.getRefreshToken());

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (storedToken.getIsRevoked() || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        User user = storedToken.getUser();

        // Revoke old token
        refreshTokenRepository.revokeByTokenHash(tokenHash);

        // Generate new tokens
        String accessToken = jwtService.generateAccessToken(new UserPrincipal(user));
        String newRefreshToken = generateRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(toUserSummary(user))
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        String tokenHash = jwtService.generateTokenHash(refreshToken);
        refreshTokenRepository.revokeByTokenHash(tokenHash);
    }

    private String generateRefreshToken(User user) {
        String token = jwtService.generateRefreshToken(new UserPrincipal(user));
        String tokenHash = jwtService.generateTokenHash(token);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusNanos(jwtService.getRefreshTokenExpiration() * 1_000_000))
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String identifier = authentication.getName();
        return userRepository.findByEmailOrPhone(identifier, identifier)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    private UserSummary toUserSummary(User user) {
        return UserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    // Inner class for UserPrincipal
    private static class UserPrincipal implements org.springframework.security.core.userdetails.UserDetails {
        private final User user;

        UserPrincipal(User user) {
            this.user = user;
        }

        @Override
        public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
            return java.util.Collections.singletonList(
                    new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name())
            );
        }

        @Override
        public String getPassword() {
            return user.getPasswordHash();
        }

        @Override
        public String getUsername() {
            return user.getPhone();
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return user.getIsVerified() || true; // Allow unverified users to login
        }
    }
}
