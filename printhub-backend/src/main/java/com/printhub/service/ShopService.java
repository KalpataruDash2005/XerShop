package com.printhub.service;

import com.printhub.dto.shop.ShopDTOs.*;
import com.printhub.entity.*;
import com.printhub.exception.BadRequestException;
import com.printhub.exception.ForbiddenException;
import com.printhub.exception.ResourceNotFoundException;
import com.printhub.mapper.*;
import com.printhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final PrinterRepository printerRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final UserRepository userRepository;
    private final ShopMapper shopMapper;
    private final PrinterMapper printerMapper;
    private final PricingRuleMapper pricingRuleMapper;
    private final ReviewMapper reviewMapper;
    private final ReviewRepository reviewRepository;

    public List<ShopDTO> getNearbyShops(BigDecimal latitude, BigDecimal longitude, Double radiusKm, Integer limit) {
        List<Shop> shops = shopRepository.findNearbyShopsWithLimit(latitude, longitude, radiusKm, limit);
        return shops.stream()
                .map(shopMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ShopDTO getShopById(Long id) {
        Shop shop = shopRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", id));
        return shopMapper.toDTO(shop);
    }

    public ShopDetailDTO getShopDetails(Long id) {
        Shop shop = shopRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", id));

        List<PrinterDTO> printers = printerRepository.findByShopIdAndDeletedAtIsNull(id)
                .stream()
                .map(printerMapper::toDTO)
                .collect(Collectors.toList());

        List<PricingRuleDTO> pricingRules = pricingRuleRepository.findByShopIdAndIsActiveTrue(id)
                .stream()
                .map(pricingRuleMapper::toDTO)
                .collect(Collectors.toList());

        List<ReviewDTO> recentReviews = reviewRepository.findByShopIdAndDeletedAtIsNullOrderByCreatedAtDesc(id, Pageable.ofSize(5))
                .stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());

        return ShopDetailDTO.builder()
                .shop(shopMapper.toDTO(shop))
                .printers(printers)
                .pricingRules(pricingRules)
                .recentReviews(recentReviews)
                .build();
    }

    @Transactional
    public ShopDTO createShop(Long ownerId, CreateShopRequest request) {
        User owner = userRepository.findByIdAndDeletedAtIsNull(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", ownerId));

        if (owner.getRole() != UserRole.SHOP_OWNER && owner.getRole() != UserRole.ADMIN) {
            owner.setRole(UserRole.SHOP_OWNER);
            userRepository.save(owner);
        }

        Shop shop = shopMapper.toEntity(request);
        shop.setOwner(owner);
        shop.setStatus(ShopStatus.PENDING);
        shop = shopRepository.save(shop);
        return shopMapper.toDTO(shop);
    }

    @Transactional
    public ShopDTO updateShop(Long shopId, Long requesterId, UpdateShopRequest request) {
        Shop shop = shopRepository.findByIdAndDeletedAtIsNull(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", shopId));

        if (!shop.getOwner().getId().equals(requesterId)) {
            throw new ForbiddenException("You can only update your own shop");
        }

        shopMapper.updateFromDTO(request, shop);
        shop = shopRepository.save(shop);
        return shopMapper.toDTO(shop);
    }

    @Transactional
    public PrinterDTO addPrinter(Long shopId, Long requesterId, CreatePrinterRequest request) {
        Shop shop = shopRepository.findByIdAndDeletedAtIsNull(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", shopId));

        if (!shop.getOwner().getId().equals(requesterId)) {
            throw new ForbiddenException("You can only manage your own shop");
        }

        Printer printer = printerMapper.toEntity(request);
        printer.setShop(shop);
        printer = printerRepository.save(printer);
        return printerMapper.toDTO(printer);
    }

    @Transactional
    public PrinterDTO updatePrinter(Long shopId, Long printerId, Long requesterId, UpdatePrinterRequest request) {
        Printer printer = printerRepository.findByIdAndShopIdAndDeletedAtIsNull(printerId, shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Printer", printerId));

        Shop shop = printer.getShop();
        if (!shop.getOwner().getId().equals(requesterId)) {
            throw new ForbiddenException("You can only manage your own shop");
        }

        if (request.getName() != null) printer.setName(request.getName());
        if (request.getModel() != null) printer.setModel(request.getModel());
        if (request.getStatus() != null) printer.setStatus(PrinterStatus.valueOf(request.getStatus()));
        if (request.getMaxPaperSize() != null) printer.setMaxPaperSize(request.getMaxPaperSize());
        if (request.getSupportsColor() != null) printer.setSupportsColor(request.getSupportsColor());
        if (request.getSupportsDuplex() != null) printer.setSupportsDuplex(request.getSupportsDuplex());
        if (request.getMaxGsm() != null) printer.setMaxGsm(request.getMaxGsm());
        if (request.getPrintsPerMinute() != null) printer.setPrintsPerMinute(request.getPrintsPerMinute());

        printer = printerRepository.save(printer);
        return printerMapper.toDTO(printer);
    }

    @Transactional
    public PricingRuleDTO addPricingRule(Long shopId, Long requesterId, CreatePricingRuleRequest request) {
        Shop shop = shopRepository.findByIdAndDeletedAtIsNull(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", shopId));

        if (!shop.getOwner().getId().equals(requesterId)) {
            throw new ForbiddenException("You can only manage your own shop");
        }

        PricingRule rule = pricingRuleMapper.toEntity(request);
        rule.setShop(shop);
        rule = pricingRuleRepository.save(rule);
        return pricingRuleMapper.toDTO(rule);
    }

    public Page<ShopDTO> getOwnerShops(Long ownerId, Pageable pageable) {
        return shopRepository.findByOwnerIdAndDeletedAtIsNull(ownerId)
                .stream()
                .map(shopMapper::toDTO)
                .map(s -> (ShopDTO) s)
                .collect(Collectors.toList())
                .stream()
                .findFirst()
                .map(s -> new org.springframework.data.domain.PageImpl<>(java.util.Collections.singletonList(s), pageable, 1))
                .orElse(new org.springframework.data.domain.PageImpl<>(java.util.Collections.emptyList(), pageable, 0));
    }
}
