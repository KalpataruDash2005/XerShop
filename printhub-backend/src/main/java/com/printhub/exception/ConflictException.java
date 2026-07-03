package com.printhub.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends PrintHubException {

    public ConflictException(String message) {
        super(message, "CONFLICT", HttpStatus.CONFLICT.value());
    }
}
