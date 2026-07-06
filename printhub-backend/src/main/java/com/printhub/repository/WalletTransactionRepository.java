package com.printhub.repository;

import com.printhub.entity.TransactionType;
import com.printhub.entity.Wallet;
import com.printhub.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    Page<WalletTransaction> findByWalletOrderByCreatedAtDesc(Wallet wallet, Pageable pageable);

    Page<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);

    List<WalletTransaction> findByWalletIdAndType(Long walletId, TransactionType type);

    @Query("SELECT SUM(t.amount) FROM WalletTransaction t WHERE t.wallet.id = :walletId AND t.type = :type")
    BigDecimal sumAmountByWalletAndType(@Param("walletId") Long walletId, @Param("type") TransactionType type);

    @Query("SELECT SUM(t.amount) FROM WalletTransaction t WHERE t.type = :type AND t.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByTypeAndDateBetween(@Param("type") TransactionType type, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
