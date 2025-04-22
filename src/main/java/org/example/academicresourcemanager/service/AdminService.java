package org.example.academicresourcemanager.service;

import org.example.academicresourcemanager.dto.RegisterAdminRequest;
import org.example.academicresourcemanager.dto.RegisterStudentRequest;
import org.example.academicresourcemanager.dto.RegisterTeacherRequest;
import org.example.academicresourcemanager.dto.UserResponse;
import org.example.academicresourcemanager.model.Role;
import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.model.UserStatus;
import org.example.academicresourcemanager.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse registerAdmin(RegisterAdminRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(Role.ADMIN);
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    public UserResponse registerTeacher(RegisterTeacherRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(Role.TEACHER);
        user.setStatus(UserStatus.PENDING);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    public UserResponse registerStudent(RegisterStudentRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(Role.STUDENT);
        user.setStatus(UserStatus.PENDING);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    public List<UserResponse> getPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING)
            .stream()
            .map(UserResponse::new)
            .collect(Collectors.toList());
    }

    public UserResponse approveUser(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getStatus() != UserStatus.PENDING) {
            throw new RuntimeException("User is not in pending status");
        }
        
        user.setStatus(UserStatus.ACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    public UserResponse rejectUser(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getStatus() != UserStatus.PENDING) {
            throw new RuntimeException("User is not in pending status");
        }
        
        user.setStatus(UserStatus.SUSPENDED);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }
}
