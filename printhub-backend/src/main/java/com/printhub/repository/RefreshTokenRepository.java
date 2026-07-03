package com.printhub.repository;

import com.printhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<com.printhub.entity.RefreshToken, Long> {

    Optional<com.printhub.entity.RefreshToken> findByTokenHash(String tokenHash);

    Optional<com.printhub.entity.RefreshToken> findByUserAndIsRevokedFalse(User user);

    @Modifying
    @Query("UPDATE com.printhub.entity.RefreshToken t SET t.isRevoked = true, t.revokedAt = CURRENT_TIMESTAMP WHERE t.user.id = :userId AND t.isRevoked = false")
    void revokeAllByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM com.printhub.entity.RefreshToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE com.printhub.entity.RefreshToken t SET t.isRevoked = true, t.revokedAt = CURRENT_TIMESTAMP WHERE t.tokenHash = :tokenHash")
    void revokeByTokenHash(@Param("tokenHash") String tokenHash);
}
