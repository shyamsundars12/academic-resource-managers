package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.dto.UserResponse;
import org.example.academicresourcemanager.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<UserResponse>> getPendingUsers() {
        List<UserResponse> users = adminService.getPendingUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/approve/{userId}")
    public ResponseEntity<UserResponse> approveUser(@PathVariable String userId) {
        UserResponse response = adminService.approveUser(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<UserResponse> rejectUser(@PathVariable String userId) {
        UserResponse response = adminService.rejectUser(userId);
        return ResponseEntity.ok(response);
    }
}
