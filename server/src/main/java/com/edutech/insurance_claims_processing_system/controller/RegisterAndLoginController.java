package com.edutech.insurance_claims_processing_system.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.edutech.insurance_claims_processing_system.dto.LoginRequest;
import com.edutech.insurance_claims_processing_system.dto.LoginResponse;
import com.edutech.insurance_claims_processing_system.entity.User;
import com.edutech.insurance_claims_processing_system.jwt.JwtUtil;
import com.edutech.insurance_claims_processing_system.service.UserService;

@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public RegisterAndLoginController(UserService userService, JwtUtil jwtUtil,
            AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username and password");
        }
        final UserDetails userDetails = userService.loadUserByUsername(request.getUsername());
        User user = userService.getUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(user.getUsername());
        return ResponseEntity
                .ok(new LoginResponse(user.getId(), token, user.getUsername(), user.getEmail(), user.getRole()));
    }
}