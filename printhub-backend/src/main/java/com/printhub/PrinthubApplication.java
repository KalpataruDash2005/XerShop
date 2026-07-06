package com.printhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class PrinthubApplication {

    public static void main(String[] args) {
        SpringApplication.run(PrinthubApplication.class, args);
    }
}
