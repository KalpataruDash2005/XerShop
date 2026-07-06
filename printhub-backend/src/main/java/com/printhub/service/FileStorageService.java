package com.printhub.service;

import com.printhub.exception.BadRequestException;
import com.printhub.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/tiff",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadPath, e);
        }
    }

    public String storeFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("File type not allowed: " + contentType);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum allowed (50 MB)");
        }

        sanitizeFileName(file.getOriginalFilename());

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String storedName = UUID.randomUUID().toString() + extension;

        Path targetLocation = uploadPath.resolve(storedName);
        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + storedName, e);
        }

        return storedName;
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = uploadPath.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            }
            throw new ResourceNotFoundException("File", "name", fileName);
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File", "name", fileName);
        }
    }

    public Path getUploadPath() {
        return uploadPath;
    }

    private void sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new BadRequestException("File name must not be empty");
        }
        if (fileName.contains("..")) {
            throw new BadRequestException("Invalid file name: " + fileName);
        }
    }
}
