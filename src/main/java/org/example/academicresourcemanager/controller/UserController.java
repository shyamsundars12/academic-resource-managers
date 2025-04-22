package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.dto.*;
import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.service.AdminService;
import org.example.academicresourcemanager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @PostMapping("/register/admin")
    public ResponseEntity<UserResponse> registerAdmin(@RequestBody RegisterAdminRequest request) {
        UserResponse response = adminService.registerAdmin(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/teacher")
    public ResponseEntity<UserResponse> registerTeacher(@RequestBody RegisterTeacherRequest request) {
        UserResponse response = adminService.registerTeacher(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/student")
    public ResponseEntity<UserResponse> registerStudent(@RequestBody RegisterStudentRequest request) {
        UserResponse response = adminService.registerStudent(request);
        return ResponseEntity.ok(response);
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // Create a new user
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody User user) {
        UserResponse createdUser = userService.createUser(user);
        return ResponseEntity.ok(createdUser);
    }

    // Update user details
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String id, @RequestBody User user) {
        UserResponse updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }
}
