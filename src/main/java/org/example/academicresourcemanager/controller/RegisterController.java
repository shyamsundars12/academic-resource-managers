package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.dto.RegisterStudentRequest;
import org.example.academicresourcemanager.dto.RegisterTeacherRequest;
import org.example.academicresourcemanager.dto.UserResponse;
import org.example.academicresourcemanager.exception.EmailAlreadyExistsException;
import org.example.academicresourcemanager.exception.UsernameAlreadyExistsException;
import org.example.academicresourcemanager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/register")
public class RegisterController {

    private final UserService userService;

    public RegisterController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/student")
    public ResponseEntity<?> registerStudent(@RequestBody RegisterStudentRequest request) {
        try {
            UserResponse response = userService.registerStudent(request);
            return ResponseEntity.ok(response);
        } catch (UsernameAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/teacher")
    public ResponseEntity<?> registerTeacher(@RequestBody RegisterTeacherRequest request) {
        try {
            UserResponse response = userService.registerTeacher(request);
            return ResponseEntity.ok(response);
        } catch (UsernameAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }
} 