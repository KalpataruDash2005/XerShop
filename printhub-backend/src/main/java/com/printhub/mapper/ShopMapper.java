package com.printhub.mapper;

import com.printhub.dto.shop.ShopDTOs;
import com.printhub.entity.Shop;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ShopMapper {

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerName", source = "owner.name")
    @Mapping(target = "status", expression = "java(shop.getStatus().name())")
    @Mapping(target = "distanceKm", ignore = true)
    ShopDTOs.ShopDTO toDTO(Shop shop);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "commissionPercent", ignore = true)
    @Mapping(target = "ratingAvg", constant = "0.0")
    @Mapping(target = "totalReviews", constant = "0")
    @Mapping(target = "isAcceptingOrders", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Shop toEntity(ShopDTOs.CreateShopRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "gstNumber", ignore = true)
    @Mapping(target = "licenseDocUrl", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "commissionPercent", ignore = true)
    @Mapping(target = "ratingAvg", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    @Mapping(target = "logoUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateFromDTO(ShopDTOs.UpdateShopRequest request, @MappingTarget Shop shop);
}
