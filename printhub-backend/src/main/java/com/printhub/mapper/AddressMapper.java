package com.printhub.mapper;

import com.printhub.dto.address.AddressDTOs;
import com.printhub.entity.Address;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    AddressDTOs.AddressDTO toDTO(Address address);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Address toEntity(AddressDTOs.CreateAddressRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateFromDTO(AddressDTOs.UpdateAddressRequest request, @MappingTarget Address address);

    default AddressDTOs.AddressDTO toSimpleDTO(Address address) {
        if (address == null) return null;
        return AddressDTOs.AddressDTO.builder()
                .label(address.getLabel())
                .line1(address.getLine1())
                .line2(address.getLine2())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .build();
    }
}
