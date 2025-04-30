package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.model.UserStatus;
import org.example.academicresourcemanager.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<User>> getPendingUsers() {
        List<User> pendingUsers = userRepository.findByStatus(UserStatus.PENDING);
        return ResponseEntity.ok(pendingUsers);
    }

    @PutMapping("/users/{userId}/approve")
    public ResponseEntity<User> approveUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setStatus(UserStatus.ACTIVE);
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{userId}/reject")
    public ResponseEntity<User> rejectUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setStatus(UserStatus.INACTIVE);
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
}
