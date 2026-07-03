package com.printhub.exception;

import lombok.Getter;

@Getter
public class PrintHubException extends RuntimeException {
    private final String errorCode;
    private final int status;

    public PrintHubException(String message, String errorCode, int status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }

    public PrintHubException(String message, String errorCode) {
        this(message, errorCode, 400);
    }
}
