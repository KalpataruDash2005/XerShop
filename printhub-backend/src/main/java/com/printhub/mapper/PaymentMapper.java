package com.printhub.mapper;

import com.printhub.dto.payment.PaymentDTOs;
import com.printhub.entity.Payment;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "status", expression = "java(payment.getStatus().name())")
    PaymentDTOs.PaymentDTO toDTO(Payment payment);
}
