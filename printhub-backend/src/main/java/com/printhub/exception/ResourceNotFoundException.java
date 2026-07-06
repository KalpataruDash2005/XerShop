package com.printhub.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends PrintHubException {

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " not found with id: " + id, "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND.value());
    }

    public ResourceNotFoundException(String resource, String field, String value) {
        super(resource + " not found with " + field + ": " + value, "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND.value());
    }

    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND.value());
    }
}
