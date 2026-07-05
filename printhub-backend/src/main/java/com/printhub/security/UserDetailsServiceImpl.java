package com.printhub.security;

import com.printhub.entity.User;
import com.printhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = null;
        try {
            Long id = Long.parseLong(identifier);
            user = userRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            // Not a user ID, fallback to email/phone
        }

        if (user == null) {
            user = userRepository.findByEmail(identifier)
                    .or(() -> userRepository.findByPhone(identifier))
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));
        }

        if (user.isDeleted()) {
            throw new UsernameNotFoundException("User not found: " + identifier);
        }

        return new UserPrincipal(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
    }
}
