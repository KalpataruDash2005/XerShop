package com.printhub.util;

import com.printhub.security.UserPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    public Long extractUserId(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal) {
            return ((UserPrincipal) userDetails).getId();
        }
        throw new IllegalArgumentException("UserDetails is not a UserPrincipal. Cannot extract user ID.");
    }
}
