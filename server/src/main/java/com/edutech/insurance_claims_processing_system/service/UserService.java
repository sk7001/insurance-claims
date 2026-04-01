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

    private UserRepository userRepository;
    private AdjusterRepository adjusterRepository;
    private InvestigatorRepository investigatorRepository;
    private PolicyholderRepository policyholderRepository;
    private UnderwriterRepository underwriterRepository;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository,
            AdjusterRepository adjusterRepository,
            InvestigatorRepository investigatorRepository,
            PolicyholderRepository policyholderRepository,
            UnderwriterRepository underwriterRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.adjusterRepository = adjusterRepository;
        this.investigatorRepository = investigatorRepository;
        this.policyholderRepository = policyholderRepository;
        this.underwriterRepository = underwriterRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {

        if (user.getRole() == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }

        switch (user.getRole().toUpperCase()) {

            case "POLICYHOLDER":
                Policyholder ph = new Policyholder();
                copyProperties(user, ph);
                return policyholderRepository.save(ph);

            case "ADJUSTER":
                Adjuster adj = new Adjuster();
                copyProperties(user, adj);
                return adjusterRepository.save(adj);

            case "INVESTIGATOR":
                Investigator inv = new Investigator();
                copyProperties(user, inv);
                return investigatorRepository.save(inv);

            case "UNDERWRITER":
                Underwriter uw = new Underwriter();
                copyProperties(user, uw);
                return underwriterRepository.save(uw);

            default:
                throw new IllegalArgumentException("Invalid role: " + user.getRole());
        }
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        User user = getUserByUsername(username);
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>());
    }

    private void copyProperties(User source, User target) {
        target.setUsername(source.getUsername());
        target.setEmail(source.getEmail());
        target.setRole(source.getRole());
        target.setPassword(passwordEncoder.encode(source.getPassword()));
    }
}