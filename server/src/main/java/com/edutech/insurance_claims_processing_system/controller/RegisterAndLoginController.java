package com.edutech.insurance_claims_processing_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;

import com.edutech.insurance_claims_processing_system.dto.LoginRequest;
import com.edutech.insurance_claims_processing_system.dto.LoginResponse;
import com.edutech.insurance_claims_processing_system.dto.ResetRequest;
import com.edutech.insurance_claims_processing_system.entity.User;
import com.edutech.insurance_claims_processing_system.jwt.JwtUtil;
import com.edutech.insurance_claims_processing_system.service.UserService;

@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Value("${app.project.id}")
    private String projectId;

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
        } catch (DisabledException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your email before logging in. Check your inbox.");
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        User user = userService.getUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(user.getUsername());
        return ResponseEntity
                .ok(new LoginResponse(user.getId(), token, user.getUsername(), user.getEmail(), user.getRole(), user.getFullName()));
    }

    /* =========================
       VERIFY EMAIL (HTML RESPONSE)
    ========================= */
    @GetMapping(value = "/verify", produces = "text/html")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        try {
            userService.verifyEmailToken(token);
            String htmlResponse = "<html><head><style>"
                    + "body { font-family: 'Arial', sans-serif; background-color: #03050a; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }"
                    + ".container { text-align: center; background: #0d0d1a; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }"
                    + "h2 { color: #22c55e; }"
                    + "a { display: inline-block; margin-top: 20px; background: #e63350; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; }"
                    + "</style></head><body>"
                    + "<div class='container'><h2>✅ Email Verified Successfully!</h2><p>Your account is now active.</p>"
                    + "<a href='https://orchardsolve.lntedutech.com/project/" + projectId + "/proxy/5000/login?verified=true'>Return to Login</a></div>"
                    + "</body></html>";
            return ResponseEntity.ok(htmlResponse);
        } catch (IllegalArgumentException e) {
            String htmlError = "<html><body style='background-color: #03050a; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif;'>"
                    + "<div style='text-align: center; background: #0d0d1a; padding: 40px; border-radius: 12px;'>"
                    + "<h2 style='color: #e63350;'>❌ Verification Failed</h2><p>" + e.getMessage() + "</p></div></body></html>";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(htmlError);
        }
    }

    /* =========================
       FORGOT PASSWORD (OTP)
    ========================= */
    @PostMapping("/forgot-password/request-otp/{email}")
    public ResponseEntity<?> requestOtp(@PathVariable String email) {
        try {
            userService.generateAndSendOtp(email);
            return ResponseEntity.ok(java.util.Map.of("message", "OTP sent to your email!"));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        try {
            userService.verifyOtpOnly(email, otp);
            return ResponseEntity.ok(java.util.Map.of("message", "OTP verified!"));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/forgot-password/verify-reset")
    public ResponseEntity<?> verifyReset(@RequestBody ResetRequest request) {
        try {
            userService.verifyOtpAndResetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully!"));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}