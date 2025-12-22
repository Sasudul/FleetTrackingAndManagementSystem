package com.fleet.tracking.controllers;


import com.fleet.tracking.models.User;
import com.fleet.tracking.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow React Frontend
public class AuthController {

    private final UserService userService;

    // Manual Constructor Injection
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        User registeredUser = userService.registerUser(user);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        // NOTE: In a full production app, you would generate a JWT token here.
        // For this phase, we verify the user exists and return user info.
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        try {
            User user = userService.getUserByEmail(email);
            // In production: if (passwordEncoder.matches(password, user.getPasswordHash())) ...
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}