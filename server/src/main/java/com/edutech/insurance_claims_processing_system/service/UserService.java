package com.edutech.insurance_claims_processing_system.service;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.insurance_claims_processing_system.entity.*;
import com.edutech.insurance_claims_processing_system.repository.*;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdjusterRepository adjusterRepository;
    private final InvestigatorRepository investigatorRepository;
    private final PolicyholderRepository policyholderRepository;
    private final UnderwriterRepository underwriterRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Autowired
    public UserService(
            UserRepository userRepository,
            AdjusterRepository adjusterRepository,
            InvestigatorRepository investigatorRepository,
            PolicyholderRepository policyholderRepository,
            UnderwriterRepository underwriterRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.adjusterRepository = adjusterRepository;
        this.investigatorRepository = investigatorRepository;
        this.policyholderRepository = policyholderRepository;
        this.underwriterRepository = underwriterRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
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

        /* ✅ SEND WELCOME EMAIL */
        emailService.sendSimpleMail(
                savedUser.getEmail(),
                "Welcome to Insurance Claims System ✅",
                "Dear " + savedUser.getUsername() + ",\n\n" +
                        "Your account has been successfully created.\n\n" +
                        "Role: " + savedUser.getRole() + "\n\n" +
                        "You can now log in and start using the system.\n\n" +
                        "Regards,\nInsurance Claims Team"
        );

        return savedUser;
    }

    /* =========================
       GET USER BY USERNAME
    ========================= */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    /* =========================
       SPRING SECURITY
    ========================= */
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = getUserByUsername(username);
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>());
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
    }
}