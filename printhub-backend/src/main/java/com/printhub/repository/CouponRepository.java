package com.printhub.repository;

import com.printhub.entity.Coupon;
import com.printhub.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeAndDeletedAtIsNull(String code);

    Optional<Coupon> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.deletedAt IS NULL AND c.validFrom <= :now AND c.validUntil >= :now")
    List<Coupon> findActiveCoupons(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.isPlatformWide = true AND c.deletedAt IS NULL AND c.validFrom <= :now AND c.validUntil >= :now")
    List<Coupon> findActivePlatformCoupons(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM Coupon c WHERE c.shop = :shop AND c.isActive = true AND c.deletedAt IS NULL AND c.validFrom <= :now AND c.validUntil >= :now")
    List<Coupon> findActiveShopCoupons(@Param("shop") Shop shop, @Param("now") LocalDateTime now);

    @Query("SELECT c FROM Coupon c WHERE c.shop.id = :shopId AND c.deletedAt IS NULL")
    List<Coupon> findByShopId(@Param("shopId") Long shopId);

    boolean existsByCode(String code);
}
