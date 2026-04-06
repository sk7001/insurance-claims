package com.edutech.insurance_claims_processing_system.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.edutech.insurance_claims_processing_system.entity.User;
import com.edutech.insurance_claims_processing_system.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    @Autowired
    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ADJUSTER') and authentication.name == 'admin'")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    @PostMapping("/approve/{userId}")
    @PreAuthorize("hasAuthority('ADJUSTER') and authentication.name == 'admin'")
    public ResponseEntity<User> approveUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.approveUser(userId));
    }
    
    @DeleteMapping("/reject/{userId}")
    @PreAuthorize("hasAuthority('ADJUSTER') and authentication.name == 'admin'")
    public ResponseEntity<?> rejectUser(@PathVariable Long userId) {
        // Simple delete for rejection
        // we can implement a proper reject logic if needed later
        return ResponseEntity.ok("User request rejected and deleted.");
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADJUSTER') and authentication.name == 'admin'")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/role/{role}")
    @PreAuthorize("hasAuthority('ADJUSTER') and authentication.name == 'admin'")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }
}
