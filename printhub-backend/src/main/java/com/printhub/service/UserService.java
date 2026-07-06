package com.printhub.service;

import com.printhub.dto.user.UserDTOs.*;
import com.printhub.entity.Address;
import com.printhub.entity.User;
import com.printhub.exception.BadRequestException;
import com.printhub.exception.ResourceNotFoundException;
import com.printhub.mapper.AddressMapper;
import com.printhub.mapper.UserMapper;
import com.printhub.repository.AddressRepository;
import com.printhub.repository.OrderRepository;
import com.printhub.repository.UserRepository;
import com.printhub.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final WalletRepository walletRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDTO getUserById(Long id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return userMapper.toDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
        }

        userMapper.updateFromDTO(request, user);
        user = userRepository.save(user);
        return userMapper.toDTO(user);
    }

    public Object getAddresses(Long userId, Pageable pageable) {
        java.util.List<com.printhub.dto.address.AddressDTOs.AddressDTO> list = addressRepository.findByUserIdAndDeletedAtIsNull(userId)
                .stream()
                .map(addressMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
        if (pageable == null || pageable.isUnpaged()) {
            return list;
        }
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());
        java.util.List<com.printhub.dto.address.AddressDTOs.AddressDTO> subList = (start <= list.size()) ? list.subList(start, end) : java.util.Collections.emptyList();
        return new org.springframework.data.domain.PageImpl<>(subList, pageable, list.size());
    }

    @Transactional
    public Object addAddress(Long userId, com.printhub.dto.address.AddressDTOs.CreateAddressRequest request) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Address address = addressMapper.toEntity(request);
        address.setUser(user);

        if (request.getIsDefault() != null && request.getIsDefault()) {
            addressRepository.clearDefaultForUser(userId);
            address.setIsDefault(true);
        }

        address = addressRepository.save(address);
        return addressMapper.toDTO(address);
    }

    @Transactional
    public Object updateAddress(Long userId, Long addressId, com.printhub.dto.address.AddressDTOs.UpdateAddressRequest request) {
        Address address = addressRepository.findByIdAndUserIdAndDeletedAtIsNull(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));

        addressMapper.updateFromDTO(request, address);

        if (request.getIsDefault() != null && request.getIsDefault()) {
            addressRepository.clearDefaultForUser(userId);
            address.setIsDefault(true);
        }

        address = addressRepository.save(address);
        return addressMapper.toDTO(address);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserIdAndDeletedAtIsNull(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
        address.setDeletedAt(java.time.LocalDateTime.now());
        addressRepository.save(address);
    }

    public UserStatsDTO getUserStats(Long userId) {
        long totalOrders = orderRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId, Pageable.unpaged()).getTotalElements();
        long completedOrders = orderRepository.countByUserIdAndStatus(userId, com.printhub.entity.OrderStatus.COMPLETED);

        BigDecimal walletBalance = walletRepository.findByUserId(userId)
                .map(w -> w.getBalance())
                .orElse(BigDecimal.ZERO);

        return UserStatsDTO.builder()
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .walletBalance(walletBalance.doubleValue())
                .build();
    }
}
