package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.entity.Category;
import com.printhub.repository.CategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category APIs")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    @Operation(summary = "Get all active categories")
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryRepository.findByIsActiveTrueAndDeletedAtIsNullOrderByDisplayOrderAsc();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get category by slug")
    public ResponseEntity<ApiResponse<Category>> getCategoryBySlug(@PathVariable String slug) {
        Category category = categoryRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new RuntimeException("Category not found: " + slug));
        return ResponseEntity.ok(ApiResponse.success(category));
    }
}
