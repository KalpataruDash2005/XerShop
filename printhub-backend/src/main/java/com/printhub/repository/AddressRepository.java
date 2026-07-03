package com.printhub.repository;

import com.printhub.entity.Address;
import com.printhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserAndDeletedAtIsNull(User user);

    List<Address> findByUserIdAndDeletedAtIsNull(Long userId);

    Optional<Address> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);

    Optional<Address> findByUserAndIsDefaultTrue(User user);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId")
    void clearDefaultForUser(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = true WHERE a.id = :addressId")
    void setAsDefault(@Param("addressId") Long addressId);
}
