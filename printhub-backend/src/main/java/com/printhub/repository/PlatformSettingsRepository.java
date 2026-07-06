package com.printhub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlatformSettingsRepository extends JpaRepository<com.printhub.entity.PlatformSettings, Long> {

    Optional<com.printhub.entity.PlatformSettings> findBySettingKey(String key);

    boolean existsBySettingKey(String key);
}
