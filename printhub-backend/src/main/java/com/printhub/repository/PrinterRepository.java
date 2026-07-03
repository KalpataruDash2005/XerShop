package com.printhub.repository;

import com.printhub.entity.Printer;
import com.printhub.entity.PrinterStatus;
import com.printhub.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrinterRepository extends JpaRepository<Printer, Long> {

    List<Printer> findByShopAndDeletedAtIsNull(Shop shop);

    List<Printer> findByShopIdAndDeletedAtIsNull(Long shopId);

    List<Printer> findByShopIdAndStatus(Long shopId, PrinterStatus status);

    Optional<Printer> findByIdAndShopIdAndDeletedAtIsNull(Long id, Long shopId);

    @Query("SELECT COUNT(p) FROM Printer p WHERE p.shop.id = :shopId AND p.status = 'ACTIVE' AND p.deletedAt IS NULL")
    long countActivePrintersByShop(@Param("shopId") Long shopId);

    @Query("SELECT SUM(p.totalPrints) FROM Printer p WHERE p.shop.id = :shopId")
    Long sumTotalPrintsByShop(@Param("shopId") Long shopId);
}
