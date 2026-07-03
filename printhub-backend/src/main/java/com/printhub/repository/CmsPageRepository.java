package com.printhub.repository;

import com.printhub.entity.CmsPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CmsPageRepository extends JpaRepository<CmsPage, Long> {

    Optional<CmsPage> findBySlugAndDeletedAtIsNull(String slug);

    Optional<CmsPage> findByIdAndDeletedAtIsNull(Long id);

    List<CmsPage> findByIsPublishedTrueAndDeletedAtIsNull();
}
