package com.printhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "printers", indexes = {
    @Index(name = "idx_printers_shop", columnList = "shop_id"),
    @Index(name = "idx_printers_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Printer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    @ToString.Exclude
    private Shop shop;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "model", length = 100)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private PrinterType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PrinterStatus status = PrinterStatus.ACTIVE;

    @Column(name = "max_paper_size", length = 10)
    private String maxPaperSize;

    @Column(name = "supports_color", nullable = false)
    @Builder.Default
    private Boolean supportsColor = false;

    @Column(name = "supports_duplex", nullable = false)
    @Builder.Default
    private Boolean supportsDuplex = false;

    @Column(name = "max_gsm")
    private Integer maxGsm;

    @Column(name = "prints_per_minute")
    private Integer printsPerMinute;

    @Column(name = "total_prints", nullable = false)
    @Builder.Default
    private Integer totalPrints = 0;

    @Column(name = "last_maintenance_at")
    private LocalDateTime lastMaintenanceAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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
