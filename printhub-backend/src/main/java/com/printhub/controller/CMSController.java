package com.printhub.controller;

import com.printhub.dto.common.ApiResponse;
import com.printhub.entity.CmsBanner;
import com.printhub.entity.CmsPage;
import com.printhub.repository.CmsBannerRepository;
import com.printhub.repository.CmsPageRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cms")
@RequiredArgsConstructor
@Tag(name = "CMS", description = "Content management APIs")
public class CMSController {

    private final CmsBannerRepository bannerRepository;
    private final CmsPageRepository pageRepository;

    @GetMapping("/banners")
    @Operation(summary = "Get active banners")
    public ResponseEntity<ApiResponse<List<CmsBanner>>> getBanners() {
        List<CmsBanner> banners = bannerRepository.findActiveBanners(LocalDateTime.now());
        return ResponseEntity.ok(ApiResponse.success(banners));
    }

    @GetMapping("/pages/{slug}")
    @Operation(summary = "Get CMS page by slug")
    public ResponseEntity<ApiResponse<CmsPage>> getPage(@PathVariable String slug) {
        CmsPage page = pageRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new RuntimeException("Page not found: " + slug));
        return ResponseEntity.ok(ApiResponse.success(page));
    }
}
