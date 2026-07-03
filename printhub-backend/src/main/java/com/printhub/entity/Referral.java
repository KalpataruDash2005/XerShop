package com.printhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "referrals", indexes = {
    @Index(name = "idx_referrals_referrer", columnList = "referrer_id"),
    @Index(name = "idx_referrals_referred", columnList = "referred_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_id", nullable = false)
    @ToString.Exclude
    private User referrer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_id", nullable = false)
    @ToString.Exclude
    private User referred;

    @Column(name = "referral_code", nullable = false, length = 20)
    private String referralCode;

    @Column(name = "bonus_amount", precision = 10, scale = 2)
    private java.math.BigDecimal bonusAmount;

    @Column(name = "is_rewarded", nullable = false)
    @Builder.Default
    private Boolean isRewarded = false;

    @Column(name = "rewarded_at")
    private LocalDateTime rewardedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
