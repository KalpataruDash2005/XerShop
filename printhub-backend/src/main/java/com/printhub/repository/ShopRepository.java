package com.printhub.repository;

import com.printhub.entity.Shop;
import com.printhub.entity.ShopStatus;
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
public interface ShopRepository extends JpaRepository<Shop, Long> {

    Optional<Shop> findByIdAndDeletedAtIsNull(Long id);

    List<Shop> findByOwnerIdAndDeletedAtIsNull(Long ownerId);

    List<Shop> findByStatusAndDeletedAtIsNull(ShopStatus status);

    Page<Shop> findByStatusAndDeletedAtIsNull(ShopStatus status, Pageable pageable);

    @Query("SELECT s FROM Shop s WHERE s.status = :status AND s.isAcceptingOrders = true AND s.deletedAt IS NULL")
    List<Shop> findActiveShops(@Param("status") ShopStatus status);

    @Query(value = "SELECT s.*, " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) * " +
            "cos(radians(s.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
            "sin(radians(s.latitude)))) AS distance " +
            "FROM shops s " +
            "WHERE s.status = 'APPROVED' AND s.is_accepting_orders = true AND s.deleted_at IS NULL " +
            "HAVING distance <= :radius " +
            "ORDER BY distance", nativeQuery = true)
    List<Shop> findNearbyShops(@Param("lat") BigDecimal latitude,
                               @Param("lng") BigDecimal longitude,
                               @Param("radius") double radiusKm);

    @Query(value = "SELECT s.*, " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) * " +
            "cos(radians(s.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
            "sin(radians(s.latitude)))) AS distance " +
            "FROM shops s " +
            "WHERE s.status = 'APPROVED' AND s.is_accepting_orders = true AND s.deleted_at IS NULL " +
            "HAVING distance <= :radius " +
            "ORDER BY distance " +
            "LIMIT :limit", nativeQuery = true)
    List<Shop> findNearbyShopsWithLimit(@Param("lat") BigDecimal latitude,
                                        @Param("lng") BigDecimal longitude,
                                        @Param("radius") double radiusKm,
                                        @Param("limit") int limit);

    @Query("SELECT COUNT(s) FROM Shop s WHERE s.status = :status AND s.deletedAt IS NULL")
    long countByStatusAndDeletedAtIsNull(@Param("status") ShopStatus status);

    @Query("SELECT AVG(s.ratingAvg) FROM Shop s WHERE s.status = 'APPROVED' AND s.deletedAt IS NULL")
    BigDecimal findAverageRating();

    boolean existsByGstNumberAndDeletedAtIsNull(String gstNumber);

    @Query("SELECT s FROM Shop s WHERE s.city = :city AND s.status = 'APPROVED' AND s.deletedAt IS NULL")
    List<Shop> findByCity(@Param("city") String city);
}
