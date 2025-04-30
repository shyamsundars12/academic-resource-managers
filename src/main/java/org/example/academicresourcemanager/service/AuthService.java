package org.example.academicresourcemanager.service;

import org.example.academicresourcemanager.config.JwtService;
import org.example.academicresourcemanager.dto.JwtResponse;
import org.example.academicresourcemanager.dto.LoginRequest;
import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.example.academicresourcemanager.model.UserStatus;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthService(AuthenticationManager authenticationManager,
                      JwtService jwtService,
                      UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        // First check if user exists and is approved
        User user = userRepository.findByUsername(loginRequest.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("Your account is not yet approved. Please wait for admin approval.");
        }

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtService.generateToken((UserDetails) authentication.getPrincipal());

        return new JwtResponse(jwt, user.getUsername(), user.getRole().name());
    }
}
