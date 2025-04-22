package org.example.academicresourcemanager.service;

import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.CourseMaterial;
import org.example.academicresourcemanager.repository.CourseMaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseMaterialService {
    private final CourseMaterialRepository courseMaterialRepository;
    private final GoogleDriveService googleDriveService;

    public CourseMaterialService(CourseMaterialRepository courseMaterialRepository, GoogleDriveService googleDriveService) {
        this.courseMaterialRepository = courseMaterialRepository;
        this.googleDriveService = googleDriveService;
    }

    public CourseMaterial createCourseMaterial(CourseMaterial material, Course course, MultipartFile file) {
        try {
            String fileUrl = googleDriveService.uploadFile(file);
            material.setCourse(course);
            material.setFileUrl(fileUrl);
            material.setFileName(file.getOriginalFilename());
            material.setFileType(file.getContentType());
            material.setFileSize(file.getSize());
            material.setCreatedAt(LocalDateTime.now());
            material.setUpdatedAt(LocalDateTime.now());
            return courseMaterialRepository.save(material);
        } catch (IOException | GeneralSecurityException e) {
            throw new RuntimeException("Failed to upload file to Google Drive", e);
        }
    }

    public CourseMaterial updateCourseMaterial(String id, CourseMaterial material) {
        CourseMaterial existingMaterial = courseMaterialRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course material not found"));
        
        existingMaterial.setTitle(material.getTitle());
        existingMaterial.setDescription(material.getDescription());
        existingMaterial.setUpdatedAt(LocalDateTime.now());
        
        return courseMaterialRepository.save(existingMaterial);
    }

    public void deleteCourseMaterial(String id) {
        CourseMaterial material = courseMaterialRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course material not found"));
        
        try {
            googleDriveService.deleteFile(material.getFileUrl());
            courseMaterialRepository.deleteById(id);
        } catch (IOException | GeneralSecurityException e) {
            throw new RuntimeException("Failed to delete file from Google Drive", e);
        }
    }

    public CourseMaterial getCourseMaterialById(String id) {
        return courseMaterialRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course material not found"));
    }

    public List<CourseMaterial> getCourseMaterialsByCourse(Course course) {
        return courseMaterialRepository.findByCourse(course);
    }

    public List<CourseMaterial> getCourseMaterialsByFileType(String fileType) {
        return courseMaterialRepository.findByFileType(fileType);
    }

    public List<CourseMaterial> searchCourseMaterials(String query) {
        return courseMaterialRepository.findByTitleContainingIgnoreCase(query);
    }
} 