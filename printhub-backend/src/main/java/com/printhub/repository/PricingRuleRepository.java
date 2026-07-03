package com.printhub.repository;

import com.printhub.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {

    List<PricingRule> findByShopIdAndIsActiveTrue(Long shopId);

    @Query("SELECT p FROM PricingRule p WHERE p.shop.id = :shopId AND p.isActive = true AND p.paperSize = :paperSize AND p.gsm = :gsm")
    Optional<PricingRule> findByShopIdAndPaperSizeAndGsm(@Param("shopId") Long shopId,
                                                         @Param("paperSize") String paperSize,
                                                         @Param("gsm") Integer gsm);

    @Query("SELECT p FROM PricingRule p WHERE p.shop.id = :shopId AND p.isActive = true AND " +
            "(:paperSize IS NULL OR p.paperSize = :paperSize) AND " +
            "(:gsm IS NULL OR p.gsm = :gsm) AND " +
            "(:colorMode IS NULL OR p.colorMode = :colorMode) AND " +
            "(:sides IS NULL OR p.sides = :sides)")
    List<PricingRule> findMatchingRules(@Param("shopId") Long shopId,
                                        @Param("paperSize") String paperSize,
                                        @Param("gsm") Integer gsm,
                                        @Param("colorMode") com.printhub.entity.ColorMode colorMode,
                                        @Param("sides") com.printhub.entity.PrintSide sides);
}
