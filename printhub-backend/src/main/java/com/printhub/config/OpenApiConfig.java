package com.printhub.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", securityScheme()));
    }

    private Info apiInfo() {
        return new Info()
                .title("PrintHub API")
                .description("On-Demand Xerox & Printing Services Platform API Documentation\n\n" +
                        "PrintHub is a multi-sided marketplace connecting customers with print shops.\n\n" +
                        "## Features\n" +
                        "- **Customer**: Upload documents, configure print options, pay online, track orders\n" +
                        "- **Shop Owner**: Manage orders, printers, pricing, inventory\n" +
                        "- **Admin**: Platform governance, analytics, CMS management\n\n" +
                        "## Authentication\n" +
                        "All protected endpoints require Bearer token authentication. " +
                        "Obtain a token from `/api/v1/auth/login` or `/api/v1/auth/register`.")
                .version("1.0.0")
                .contact(new Contact()
                        .name("PrintHub Support")
                        .email("support@printhub.com")
                        .url("https://printhub.com"))
                .license(new License()
                        .name("Proprietary")
                        .url("https://printhub.com/terms"));
    }

    private SecurityScheme securityScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer")
                .description("JWT Authorization header using the Bearer scheme. " +
                        "Example: Authorization: Bearer {token}");
    }
}
