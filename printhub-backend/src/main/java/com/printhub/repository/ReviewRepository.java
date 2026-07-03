package com.printhub.repository;

import com.printhub.entity.Review;
import com.printhub.entity.Shop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByShopAndDeletedAtIsNullOrderByCreatedAtDesc(Shop shop, Pageable pageable);

    Page<Review> findByShopIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long shopId, Pageable pageable);

    List<Review> findByUserIdAndDeletedAtIsNull(Long userId);

    Optional<Review> findByOrderId(Long orderId);

    Optional<Review> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.shop.id = :shopId AND r.isVisible = true AND r.deletedAt IS NULL")
    BigDecimal findAverageRatingByShop(@Param("shopId") Long shopId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.shop.id = :shopId AND r.isVisible = true AND r.deletedAt IS NULL")
    long countByShopId(@Param("shopId") Long shopId);

    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.shop.id = :shopId AND r.isVisible = true AND r.deletedAt IS NULL GROUP BY r.rating")
    List<Object[]> countByRatingGroupByShop(@Param("shopId") Long shopId);

    boolean existsByOrderId(Long orderId);
}
