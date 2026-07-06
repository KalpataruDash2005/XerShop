package com.printhub.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends PrintHubException {

    public ForbiddenException(String message) {
        super(message, "FORBIDDEN", HttpStatus.FORBIDDEN.value());
    }
}
