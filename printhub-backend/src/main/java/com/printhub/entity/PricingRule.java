package com.printhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pricing_rules", indexes = {
    @Index(name = "idx_pricing_shop", columnList = "shop_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    @ToString.Exclude
    private Shop shop;

    @Column(name = "paper_size", length = 20)
    private String paperSize;

    @Column(name = "gsm")
    private Integer gsm;

    @Enumerated(EnumType.STRING)
    @Column(name = "color_mode")
    private ColorMode colorMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "sides")
    private PrintSide sides;

    @Enumerated(EnumType.STRING)
    @Column(name = "binding")
    private BindingType binding;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "price_per_page", precision = 10, scale = 2)
    private BigDecimal pricePerPage;

    @Column(name = "price_per_copy", precision = 10, scale = 2)
    private BigDecimal pricePerCopy;

    @Column(name = "lamination_price", precision = 10, scale = 2)
    private BigDecimal laminationPrice;

    @Column(name = "binding_price", precision = 10, scale = 2)
    private BigDecimal bindingPrice;

    @Column(name = "min_pages")
    private Integer minPages;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
