package com.printhub.repository;

import com.printhub.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {

    List<Referral> findByReferrerId(Long referrerId);

    List<Referral> findByReferredId(Long referredId);

    Optional<Referral> findByReferralCode(String referralCode);

    @Query("SELECT COUNT(r) FROM Referral r WHERE r.referrer.id = :referrerId AND r.isRewarded = true")
    long countRewardedReferralsByReferrer(@Param("referrerId") Long referrerId);

    boolean existsByReferredId(Long referredId);
}
