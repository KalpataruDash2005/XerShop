package com.printhub.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends PrintHubException {

    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED.value());
    }
}
