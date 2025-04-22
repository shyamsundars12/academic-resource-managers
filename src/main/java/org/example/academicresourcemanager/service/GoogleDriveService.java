package org.example.academicresourcemanager.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class GoogleDriveService {
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String APPLICATION_NAME = "Academic Resource Manager";

    @Value("${google.drive.credentials.path}")
    private String credentialsPath;

    @Value("${google.drive.folder.id}")
    private String folderId;

    private Drive getDriveService() throws IOException, GeneralSecurityException {
        HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        GoogleCredential credential = GoogleCredential.fromStream(
            getClass().getResourceAsStream(credentialsPath))
            .createScoped(Collections.singleton(DriveScopes.DRIVE_FILE));

        return new Drive.Builder(httpTransport, JSON_FACTORY, credential)
            .setApplicationName(APPLICATION_NAME)
            .build();
    }

    public String uploadFile(MultipartFile multipartFile) throws IOException, GeneralSecurityException {
        Drive driveService = getDriveService();

        // Create metadata for the file
        File fileMetadata = new File();
        fileMetadata.setName(multipartFile.getOriginalFilename());
        fileMetadata.setParents(Collections.singletonList(folderId));

        // Convert MultipartFile to java.io.File
        java.io.File tempFile = java.io.File.createTempFile("temp", null);
        multipartFile.transferTo(tempFile);

        // Create FileContent
        FileContent mediaContent = new FileContent(multipartFile.getContentType(), tempFile);

        // Upload file
        File uploadedFile = driveService.files().create(fileMetadata, mediaContent)
            .setFields("id, webViewLink")
            .execute();

        // Delete temporary file
        tempFile.delete();

        return uploadedFile.getWebViewLink();
    }

    public void deleteFile(String fileUrl) throws IOException, GeneralSecurityException {
        Drive driveService = getDriveService();
        
        // Extract file ID from URL
        String fileId = extractFileIdFromUrl(fileUrl);
        
        if (fileId != null) {
            driveService.files().delete(fileId).execute();
        }
    }

    private String extractFileIdFromUrl(String fileUrl) {
        // Extract file ID from Google Drive URL
        // Example URL: https://drive.google.com/file/d/1ABC...XYZ/view?usp=sharing
        String[] parts = fileUrl.split("/");
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].equals("d") && i + 1 < parts.length) {
                return parts[i + 1];
            }
        }
        return null;
    }
} 