package com.printhub.repository;

import com.printhub.entity.Inventory;
import com.printhub.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByShopAndDeletedAtIsNull(Shop shop);

    List<Inventory> findByShopIdAndDeletedAtIsNull(Long shopId);

    List<Inventory> findByShopIdAndIsLowStockTrue(Long shopId);

    @Query("SELECT i FROM Inventory i WHERE i.shop.id = :shopId AND i.paperSize = :paperSize AND i.gsm = :gsm AND i.deletedAt IS NULL")
    Optional<Inventory> findByShopIdAndPaperSizeAndGsm(@Param("shopId") Long shopId,
                                                       @Param("paperSize") String paperSize,
                                                       @Param("gsm") Integer gsm);

    @Query("SELECT i FROM Inventory i WHERE i.shop.id = :shopId AND i.itemType = :itemType AND i.deletedAt IS NULL")
    List<Inventory> findByShopIdAndItemType(@Param("shopId") Long shopId, @Param("itemType") String itemType);
}
