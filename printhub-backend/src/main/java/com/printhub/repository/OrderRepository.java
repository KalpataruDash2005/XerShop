package com.printhub.repository;

import com.printhub.entity.Order;
import com.printhub.entity.OrderStatus;
import com.printhub.entity.Shop;
import com.printhub.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByIdAndDeletedAtIsNull(Long id);

    Page<Order> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);

    Optional<Order> findByOrderNumberAndDeletedAtIsNull(String orderNumber);

    Page<Order> findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<Order> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findByShopAndDeletedAtIsNullOrderByCreatedAtDesc(Shop shop, Pageable pageable);

    Page<Order> findByShopIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long shopId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status AND o.deletedAt IS NULL ORDER BY o.createdAt DESC")
    Page<Order> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.shop.id = :shopId AND o.status = :status AND o.deletedAt IS NULL ORDER BY o.createdAt DESC")
    Page<Order> findByShopIdAndStatus(@Param("shopId") Long shopId, @Param("status") OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.shop.id = :shopId AND o.status IN :statuses AND o.deletedAt IS NULL ORDER BY o.createdAt DESC")
    List<Order> findByShopIdAndStatusIn(@Param("shopId") Long shopId, @Param("statuses") List<OrderStatus> statuses);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.shop.id = :shopId AND o.status = :status AND o.deletedAt IS NULL")
    long countByShopIdAndStatus(@Param("shopId") Long shopId, @Param("status") OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.shop.id = :shopId AND o.status = 'COMPLETED' AND o.deletedAt IS NULL")
    BigDecimal sumCompletedAmountByShop(@Param("shopId") Long shopId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumCompletedAmountBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :startDate AND :endDate")
    long countByStatusAndDateBetween(@Param("status") OrderStatus status, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT FUNCTION('DATE', o.createdAt) as date, COUNT(o) as count, SUM(o.totalAmount) as total " +
            "FROM Order o WHERE o.shop.id = :shopId AND o.status = 'COMPLETED' AND o.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY FUNCTION('DATE', o.createdAt) ORDER BY date")
    List<Object[]> getDailyOrderStats(@Param("shopId") Long shopId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    boolean existsByUserAndStatusIn(User user, List<OrderStatus> statuses);

    @Query(value = "SELECT o.* FROM orders o WHERE o.user_id = :userId AND o.status = 'COMPLETED' AND o.deleted_at IS NULL ORDER BY o.created_at DESC LIMIT 1", nativeQuery = true)
    Optional<Order> findLatestCompletedOrderByUser(@Param("userId") Long userId);

    Page<Order> findByShopIdInAndDeletedAtIsNullOrderByCreatedAtDesc(List<Long> shopIds, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.status = :status AND o.deletedAt IS NULL")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") OrderStatus status);

    List<Order> findByStatusOrderByCompletedAtDesc(OrderStatus status);
}
