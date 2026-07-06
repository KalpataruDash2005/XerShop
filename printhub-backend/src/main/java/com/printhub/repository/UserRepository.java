package com.printhub.repository;

import com.printhub.entity.User;
import com.printhub.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Optional<User> findByEmailOrPhone(String email, String phone);

    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.phone = :identifier")
    Optional<User> findByEmailOrPhone(@Param("identifier") String identifier);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<User> findByRole(UserRole role);

    List<User> findByRoleAndDeletedAtIsNull(UserRole role);

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    List<User> findAllActive();

    Optional<User> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.deletedAt IS NULL")
    long countByRoleAndDeletedAtIsNull(@Param("role") UserRole role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate AND u.role = :role")
    long countByCreatedAtAfterAndRole(@Param("startDate") java.time.LocalDateTime startDate, @Param("role") UserRole role);
}
