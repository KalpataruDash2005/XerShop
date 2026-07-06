package com.printhub.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends PrintHubException {

    public BadRequestException(String message) {
        super(message, "BAD_REQUEST", HttpStatus.BAD_REQUEST.value());
    }

    public BadRequestException(String message, String errorCode) {
        super(message, errorCode, HttpStatus.BAD_REQUEST.value());
    }
}
