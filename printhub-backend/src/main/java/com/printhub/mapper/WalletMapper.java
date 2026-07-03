package com.printhub.mapper;

import com.printhub.dto.wallet.WalletDTOs;
import com.printhub.entity.Wallet;
import com.printhub.entity.WalletTransaction;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface WalletMapper {

    @Mapping(target = "userId", source = "user.id")
    WalletDTOs.WalletDTO toDTO(Wallet wallet);

    @Mapping(target = "type", expression = "java(transaction.getType().name())")
    WalletDTOs.WalletTransactionDTO toTransactionDTO(WalletTransaction transaction);
}
