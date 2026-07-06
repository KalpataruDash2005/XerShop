package com.printhub.repository;

import com.printhub.entity.User;
import com.printhub.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUser(User user);

    Optional<Wallet> findByUserId(Long userId);

    Optional<Wallet> findByReferralCode(String referralCode);

    @Query("SELECT SUM(w.balance) FROM Wallet w")
    BigDecimal sumTotalBalance();

    @Query("SELECT SUM(w.totalEarned) FROM Wallet w WHERE w.user.id = :userId")
    BigDecimal sumTotalEarnedByUser(@Param("userId") Long userId);
}
