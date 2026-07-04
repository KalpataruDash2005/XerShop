package com.printhub.repository;

import com.printhub.entity.User;
import com.printhub.entity.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should find user by email")
    void findByEmail_Success() {
        // Given
        User user = User.builder()
                .name("Test User")
                .email("test@example.com")
                .phone("+919876543210")
                .passwordHash("hashedPassword")
                .role(UserRole.CUSTOMER)
                .isVerified(false)
                .build();
        entityManager.persistAndFlush(user);

        // When
        Optional<User> found = userRepository.findByEmail("test@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test User");
    }

    @Test
    @DisplayName("Should find user by phone")
    void findByPhone_Success() {
        // Given
        User user = User.builder()
                .name("Test User")
                .email("test2@example.com")
                .phone("+919876543211")
                .passwordHash("hashedPassword")
                .role(UserRole.CUSTOMER)
                .isVerified(false)
                .build();
        entityManager.persistAndFlush(user);

        // When
        Optional<User> found = userRepository.findByPhone("+919876543211");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test User");
    }

    @Test
    @DisplayName("Should return empty when user not found")
    void findByEmail_NotFound() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should check if email exists")
    void existsByEmail_True() {
        // Given
        User user = User.builder()
                .name("Test User")
                .email("test3@example.com")
                .phone("+919876543212")
                .passwordHash("hashedPassword")
                .role(UserRole.CUSTOMER)
                .isVerified(false)
                .build();
        entityManager.persistAndFlush(user);

        // When
        boolean exists = userRepository.existsByEmail("test3@example.com");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should not find soft-deleted users")
    void findByIdAndDeletedAtIsNull_ExcludesDeleted() {
        // Given
        User activeUser = User.builder()
                .name("Active User")
                .email("active@example.com")
                .phone("+919876543213")
                .passwordHash("hashedPassword")
                .role(UserRole.CUSTOMER)
                .isVerified(false)
                .build();
        entityManager.persistAndFlush(activeUser);

        User deletedUser = User.builder()
                .name("Deleted User")
                .email("deleted@example.com")
                .phone("+919876543214")
                .passwordHash("hashedPassword")
                .role(UserRole.CUSTOMER)
                .isVerified(false)
                .deletedAt(LocalDateTime.now())
                .build();
        entityManager.persistAndFlush(deletedUser);

        // When
        Optional<User> foundActive = userRepository.findByIdAndDeletedAtIsNull(activeUser.getId());
        Optional<User> foundDeleted = userRepository.findByIdAndDeletedAtIsNull(deletedUser.getId());

        // Then
        assertThat(foundActive).isPresent();
        assertThat(foundDeleted).isEmpty();
    }

    @Test
    @DisplayName("Should find users by role")
    void findByRole_Success() {
        // Given
        User customer = User.builder()
                .name("Customer")
                .email("customer@example.com")
                .phone("+919876543215")
                .passwordHash("hashedPassword")
                .role(UserRole.CUSTOMER)
                .isVerified(false)
                .build();
        User shopOwner = User.builder()
                .name("Shop Owner")
                .email("owner@example.com")
                .phone("+919876543216")
                .passwordHash("hashedPassword")
                .role(UserRole.SHOP_OWNER)
                .isVerified(false)
                .build();
        entityManager.persist(customer);
        entityManager.persist(shopOwner);
        entityManager.flush();

        // When
        List<User> customers = userRepository.findByRole(UserRole.CUSTOMER);
        List<User> shopOwners = userRepository.findByRole(UserRole.SHOP_OWNER);

        // Then
        assertThat(customers).hasSizeGreaterThanOrEqualTo(1);
        assertThat(shopOwners).hasSizeGreaterThanOrEqualTo(1);
    }
}
