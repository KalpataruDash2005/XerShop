package com.printhub.repository;

import com.printhub.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByParentIdIsNullAndDeletedAtIsNullOrderByDisplayOrderAsc();

    List<Category> findByParentIdAndDeletedAtIsNullOrderByDisplayOrderAsc(Long parentId);

    List<Category> findByIsActiveTrueAndDeletedAtIsNullOrderByDisplayOrderAsc();

    Optional<Category> findBySlugAndDeletedAtIsNull(String slug);

    Optional<Category> findByIdAndDeletedAtIsNull(Long id);
}
