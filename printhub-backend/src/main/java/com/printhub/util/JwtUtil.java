package com.printhub.util;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import com.printhub.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

/**
 * Utility class for extracting data from JWT token provided by Spring Security.
 */
@Component
public class JwtUtil {
    private static final String USER_ID_CLAIM = "userId";

    public JwtUtil() { }

    /**
     * Extracts the user ID from the {@link UserDetails} principal.
     * If the principal is a {@link UserPrincipal}, extracts the ID directly.
     * Otherwise, falls back to parsing the username as a JWT token (if applicable),
     * or returns 1L as fallback.
     */
    public Long extractUserId(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal) {
            return ((UserPrincipal) userDetails).getId();
        }
        
        try {
            String token = userDetails.getUsername();
            Claims claims = Jwts.parser().build().parseSignedClaims(token).getPayload();
            Object idObj = claims.get(USER_ID_CLAIM);
            if (idObj instanceof Number) {
                return ((Number) idObj).longValue();
            }
            if (idObj instanceof String) {
                return Long.parseLong((String) idObj);
            }
        } catch (Exception e) {
            // Silence warning if it's not a JWT token
        }
        return 1L;
    }
}
