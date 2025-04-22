package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.dto.RegisterStudentRequest;
import org.example.academicresourcemanager.dto.RegisterTeacherRequest;
import org.example.academicresourcemanager.dto.UserResponse;
import org.example.academicresourcemanager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/register")
public class RegisterController {

    private final UserService userService;

    public RegisterController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/student")
    public ResponseEntity<UserResponse> registerStudent(@RequestBody RegisterStudentRequest request) {
        UserResponse response = userService.registerStudent(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/teacher")
    public ResponseEntity<UserResponse> registerTeacher(@RequestBody RegisterTeacherRequest request) {
        UserResponse response = userService.registerTeacher(request);
        return ResponseEntity.ok(response);
    }
} 