package com.printhub.mapper;

import com.printhub.dto.shop.ShopDTOs;
import com.printhub.entity.PricingRule;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PricingRuleMapper {

    @Mapping(target = "colorMode", expression = "java(rule.getColorMode() != null ? rule.getColorMode().name() : null)")
    @Mapping(target = "sides", expression = "java(rule.getSides() != null ? rule.getSides().name() : null)")
    @Mapping(target = "binding", expression = "java(rule.getBinding() != null ? rule.getBinding().name() : null)")
    ShopDTOs.PricingRuleDTO toDTO(PricingRule rule);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "colorMode", expression = "java(request.getColorMode() != null ? com.printhub.entity.ColorMode.valueOf(request.getColorMode()) : null)")
    @Mapping(target = "sides", expression = "java(request.getSides() != null ? com.printhub.entity.PrintSide.valueOf(request.getSides()) : null)")
    @Mapping(target = "binding", expression = "java(request.getBinding() != null ? com.printhub.entity.BindingType.valueOf(request.getBinding()) : null)")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PricingRule toEntity(ShopDTOs.CreatePricingRuleRequest request);
}
