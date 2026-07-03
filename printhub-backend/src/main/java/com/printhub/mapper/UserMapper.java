package com.printhub.mapper;

import com.printhub.dto.auth.AuthDTOs;
import com.printhub.dto.user.UserDTOs;
import com.printhub.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserDTOs.UserDTO toDTO(User user);

    AuthDTOs.UserSummary toUserSummary(User user);

    @Mapping(target = "role", expression = "java(role)")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "isVerified", constant = "false")
    @Mapping(target = "profileImageUrl", ignore = true)
    @Mapping(target = "firebaseToken", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    User toEntity(com.printhub.dto.auth.AuthDTOs.RegisterRequest request, String role);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "isVerified", ignore = true)
    @Mapping(target = "firebaseToken", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateFromDTO(UserDTOs.UpdateProfileRequest request, @MappingTarget User user);
}
