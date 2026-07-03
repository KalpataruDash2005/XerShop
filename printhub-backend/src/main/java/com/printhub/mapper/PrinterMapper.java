package com.printhub.mapper;

import com.printhub.dto.shop.ShopDTOs;
import com.printhub.entity.Printer;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PrinterMapper {

    @Mapping(target = "type", expression = "java(printer.getType().name())")
    @Mapping(target = "status", expression = "java(printer.getStatus().name())")
    ShopDTOs.PrinterDTO toDTO(Printer printer);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "type", expression = "java(com.printhub.entity.PrinterType.valueOf(request.getType()))")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "totalPrints", constant = "0")
    @Mapping(target = "lastMaintenanceAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "supportsColor", defaultValue = "false")
    @Mapping(target = "supportsDuplex", defaultValue = "false")
    Printer toEntity(ShopDTOs.CreatePrinterRequest request);
}
