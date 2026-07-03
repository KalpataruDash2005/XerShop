package com.printhub.repository;

import com.printhub.entity.CmsBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CmsBannerRepository extends JpaRepository<CmsBanner, Long> {

    List<CmsBanner> findByDeletedAtIsNullOrderByPositionAsc();

    @Query("SELECT b FROM CmsBanner b WHERE b.isActive = true AND b.deletedAt IS NULL AND " +
            "(b.validFrom IS NULL OR b.validFrom <= :now) AND " +
            "(b.validUntil IS NULL OR b.validUntil >= :now) " +
            "ORDER BY b.position ASC")
    List<CmsBanner> findActiveBanners(@Param("now") LocalDateTime now);
}
