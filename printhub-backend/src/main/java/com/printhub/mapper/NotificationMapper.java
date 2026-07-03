package com.printhub.mapper;

import com.printhub.dto.notification.NotificationDTOs;
import com.printhub.entity.Notification;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationDTOs.NotificationDTO toDTO(Notification notification);
}
