package com.printhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items", indexes = {
    @Index(name = "idx_order_items_order", columnList = "order_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    private Order order;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_type", length = 50)
    private String fileType;

    @Column(name = "page_count", nullable = false)
    private Integer pageCount;

    @Column(name = "copies", nullable = false)
    private Integer copies;

    @Enumerated(EnumType.STRING)
    @Column(name = "color_mode", nullable = false)
    private ColorMode colorMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "sides", nullable = false)
    private PrintSide sides;

    @Column(name = "paper_size", length = 20)
    private String paperSize;

    @Column(name = "gsm")
    private Integer gsm;

    @Enumerated(EnumType.STRING)
    @Column(name = "binding")
    private BindingType binding;

    @Column(name = "lamination", nullable = false)
    @Builder.Default
    private Boolean lamination = false;

    @Column(name = "page_range", length = 100)
    private String pageRange;

    @Column(name = "line_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
