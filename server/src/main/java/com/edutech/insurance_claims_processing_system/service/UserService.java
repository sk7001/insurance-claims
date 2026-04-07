package com.edutech.insurance_claims_processing_system.service;

import java.util.ArrayList;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.insurance_claims_processing_system.entity.*;
import com.edutech.insurance_claims_processing_system.repository.*;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdjusterRepository adjusterRepository;
    private final InvestigatorRepository investigatorRepository;
    private final PolicyholderRepository policyholderRepository;
    private final UnderwriterRepository underwriterRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OtpRepository otpRepository;

    @Autowired
    public UserService(
            UserRepository userRepository,
            AdjusterRepository adjusterRepository,
            InvestigatorRepository investigatorRepository,
            PolicyholderRepository policyholderRepository,
            UnderwriterRepository underwriterRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            OtpRepository otpRepository) {

        this.userRepository = userRepository;
        this.adjusterRepository = adjusterRepository;
        this.investigatorRepository = investigatorRepository;
        this.policyholderRepository = policyholderRepository;
        this.underwriterRepository = underwriterRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.otpRepository = otpRepository;
    }

    /* =========================
       REGISTER USER (EMAIL ✅)
    ========================= */
    public User registerUser(User user) {

        if (user.getRole() == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("User with same username exists");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with same email exists");
        }

        User savedUser;

        switch (user.getRole().toUpperCase()) {

            case "POLICYHOLDER":
                Policyholder ph = new Policyholder();
                copyProperties(user, ph);
                savedUser = policyholderRepository.save(ph);
                break;

            case "ADJUSTER":
                Adjuster adj = new Adjuster();
                copyProperties(user, adj);
                savedUser = adjusterRepository.save(adj);
                break;

            case "INVESTIGATOR":
                Investigator inv = new Investigator();
                copyProperties(user, inv);
                savedUser = investigatorRepository.save(inv);
                break;

            case "UNDERWRITER":
                Underwriter uw = new Underwriter();
                copyProperties(user, uw);
                savedUser = underwriterRepository.save(uw);
                break;

            default:
                throw new IllegalArgumentException("Invalid role: " + user.getRole());
        }

        /* ✅ SEND VERIFICATION EMAIL */
        emailService.sendVerificationHtmlMail(
            savedUser.getEmail(),
            savedUser.getFullName(),
            savedUser.getVerificationToken()
        );

        return savedUser;
    }

    public void verifyEmailToken(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token."));
        
        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
    }

    /* =========================
       GET USER BY USERNAME
    ========================= */
    public User getUserByUsername(String username) {
        String normalized = username.toLowerCase().trim();
        return userRepository.findByUsername(normalized)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found for email: " + email));
    }

    /* =========================
       UPDATE PROFILE
    ========================= */
    public User updateProfile(Long userId, User updatedData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Only these 3 are editable per requirements
        user.setFullName(updatedData.getFullName());
        user.setUsername(updatedData.getUsername());
        user.setPhoneNumber(updatedData.getPhoneNumber());

        return userRepository.save(user);
    }

    /* =========================
       SPRING SECURITY (LOGIN BY USERNAME)
    ========================= */
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = getUserByUsername(username);
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isVerified(),
                true,
                true,
                true,
                new ArrayList<>());
    }

    /* =========================
       OTP-BASED FORGOT PASSWORD
    ========================= */
    public void generateAndSendOtp(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        // 1. Verify user exists (case-insensitive)
        if (!userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("No account found with this email: " + normalizedEmail);
        }

        // 2. Clear old OTPs
        otpRepository.deleteByEmail(normalizedEmail);

        // 3. Generate 6-digit OTP
        String otp = String.valueOf((int) ((Math.random() * (999999 - 100000)) + 100000));

        // 4. Save with 5-min expiry
        OtpRecord record = new OtpRecord(normalizedEmail, otp, 5);
        otpRepository.save(record);

        // 5. Send Email
        emailService.sendGenericHtmlMail(
                email,
                "Your Password Reset Code 🛡️",
                email.split("@")[0],
                "Your verification code is: <br/><br/>" +
                        "<div style=\"font-size: 24px; font-weight: bold; padding: 15px; background: #1a1f33; display: inline-block; border-radius: 8px; letter-spacing: 5px; color: #00c853;\">" + otp + "</div><br/><br/>" +
                        "This code will expire in 5 minutes."
        );
    }

    public void verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = email.toLowerCase().trim();
        // 1. Find OTP
        OtpRecord record = otpRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No verification record found for this email: " + normalizedEmail));

        // 2. Validate
        if (record.isExpired()) {
            otpRepository.delete(record);
            throw new IllegalArgumentException("OTP has expired.");
        }
        if (!record.getOtp().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP code.");
        }

        // 3. Reset Password
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found mid-reset for: " + normalizedEmail));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 4. Cleanup
        otpRepository.delete(record);

        // 5. Send Success Email Notification
        emailService.sendGenericHtmlMail(
                normalizedEmail,
                "Password Reset Successful 🛡️",
                (user.getFullName() != null ? user.getFullName() : user.getUsername()),
                "This is a confirmation that your password has been successfully reset. " +
                "If you did not perform this action, please contact support immediately."
        );
    }

    public void verifyOtpOnly(String email, String otp) {
        String normalizedEmail = email.toLowerCase().trim();
        OtpRecord record = otpRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No verification record found for this email: " + normalizedEmail));

        if (record.isExpired()) {
            otpRepository.delete(record);
            throw new IllegalArgumentException("OTP has expired.");
        }
        if (!record.getOtp().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP code.");
        }
    }

    /* =========================
       COPY PROPERTIES
    ========================= */
    private void copyProperties(User source, User target) {
        target.setUsername(source.getUsername());
        target.setEmail(source.getEmail());
        target.setRole(source.getRole());
        target.setPassword(passwordEncoder.encode(source.getPassword()));
        target.setPhoneNumber(source.getPhoneNumber());
        target.setFullName(source.getFullName());
        target.setVerified(false);
        target.setVerificationToken(UUID.randomUUID().toString());
    }
}