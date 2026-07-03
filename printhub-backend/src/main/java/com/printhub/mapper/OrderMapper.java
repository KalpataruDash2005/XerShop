package com.printhub.mapper;

import com.printhub.dto.order.OrderDTOs;
import com.printhub.entity.Order;
import com.printhub.entity.OrderItem;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {AddressMapper.class})
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "shopName", source = "shop.name")
    @Mapping(target = "status", expression = "java(order.getStatus().name())")
    @Mapping(target = "deliveryType", expression = "java(order.getDeliveryType().name())")
    @Mapping(target = "deliveryAddress", source = "deliveryAddress")
    @Mapping(target = "couponCode", source = "coupon.code")
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "timeline", ignore = true)
    OrderDTOs.OrderDTO toDTO(Order order);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orderNumber", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "deliveryType", expression = "java(com.printhub.entity.DeliveryType.valueOf(request.getDeliveryType()))")
    @Mapping(target = "deliveryAddress", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "discount", constant = "0.0")
    @Mapping(target = "tax", constant = "0.0")
    @Mapping(target = "deliveryCharge", constant = "0.0")
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "coupon", ignore = true)
    @Mapping(target = "walletAmountUsed", ignore = true)
    @Mapping(target = "estimatedCompletionAt", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Order toEntity(OrderDTOs.CreateOrderRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "colorMode", expression = "java(com.printhub.entity.ColorMode.valueOf(request.getColorMode()))")
    @Mapping(target = "sides", expression = "java(com.printhub.entity.PrintSide.valueOf(request.getSides()))")
    @Mapping(target = "binding", expression = "java(request.getBinding() != null ? com.printhub.entity.BindingType.valueOf(request.getBinding()) : null)")
    @Mapping(target = "lamination", defaultValue = "false")
    @Mapping(target = "lineTotal", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    OrderItem toEntity(OrderDTOs.CreateOrderItemRequest request);

    @Mapping(target = "colorMode", expression = "java(item.getColorMode().name())")
    @Mapping(target = "sides", expression = "java(item.getSides().name())")
    @Mapping(target = "binding", expression = "java(item.getBinding() != null ? item.getBinding().name() : null)")
    OrderDTOs.OrderItemDTO toItemDTO(OrderItem item);

    @Mapping(target = "status", expression = "java(timeline.getStatus().name())")
    @Mapping(target = "changedByName", source = "changedBy.name")
    OrderDTOs.TimelineDTO toTimelineDTO(com.printhub.entity.OrderTimeline timeline);
}
