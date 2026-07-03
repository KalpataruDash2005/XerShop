package com.printhub.mapper;

import com.printhub.dto.coupon.CouponDTOs;
import com.printhub.entity.Coupon;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    @Mapping(target = "type", expression = "java(coupon.getType().name())")
    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "shopName", source = "shop.name")
    CouponDTOs.CouponDTO toDTO(Coupon coupon);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", expression = "java(com.printhub.entity.CouponType.valueOf(request.getType()))")
    @Mapping(target = "usedCount", constant = "0")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Coupon toEntity(CouponDTOs.CreateCouponRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "value", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    @Mapping(target = "isPlatformWide", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateFromDTO(CouponDTOs.UpdateCouponRequest request, @MappingTarget Coupon coupon);
}
