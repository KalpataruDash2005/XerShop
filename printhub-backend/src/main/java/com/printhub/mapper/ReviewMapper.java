package com.printhub.mapper;

import com.printhub.dto.review.ReviewDTOs;
import com.printhub.entity.Review;
import org.mapstruct.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "shopName", source = "shop.name")
    @Mapping(target = "images", expression = "java(parseImages(review.getImages()))")
    ReviewDTOs.ReviewDTO toDTO(Review review);

    default List<String> parseImages(String images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.asList(images.split(","));
    }
}
