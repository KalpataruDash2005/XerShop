package com.printhub.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class OrderNumberGenerator {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMdd");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HHmmss");
    private final AtomicLong counter = new AtomicLong(0);

    public String generate() {
        LocalDateTime now = LocalDateTime.now();
        String datePart = now.format(DATE_FORMAT);
        String timePart = now.format(TIME_FORMAT);
        String sequencePart = String.format("%04d", counter.incrementAndGet() % 10000);
        return "PH" + datePart + "-" + timePart + "-" + sequencePart;
    }
}
