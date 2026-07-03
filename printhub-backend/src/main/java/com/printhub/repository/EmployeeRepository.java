package com.printhub.repository;

import com.printhub.entity.Employee;
import com.printhub.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByShopAndDeletedAtIsNull(Shop shop);

    List<Employee> findByShopIdAndDeletedAtIsNull(Long shopId);

    List<Employee> findByUserIdAndDeletedAtIsNull(Long userId);

    Optional<Employee> findByShopIdAndUserIdAndDeletedAtIsNull(Long shopId, Long userId);

    @Query("SELECT e FROM Employee e WHERE e.shop.id = :shopId AND e.isActive = true AND e.deletedAt IS NULL")
    List<Employee> findActiveEmployeesByShop(@Param("shopId") Long shopId);

    @Query("SELECT CASE WHEN EXISTS (SELECT 1 FROM Employee e WHERE e.user.id = :userId AND e.shop.id = :shopId AND e.isActive = true AND e.deletedAt IS NULL) THEN true ELSE false END")
    boolean isEmployeeOfShop(@Param("userId") Long userId, @Param("shopId") Long shopId);

    @Query("SELECT e FROM Employee e WHERE e.user.id = :userId AND e.isActive = true AND e.deletedAt IS NULL")
    List<Employee> findActiveShopsByEmployee(@Param("userId") Long userId);
}
