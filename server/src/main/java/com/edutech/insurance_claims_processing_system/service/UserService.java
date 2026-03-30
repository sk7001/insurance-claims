package com.edutech.insurance_claims_processing_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.insurance_claims_processing_system.entity.*;
import com.edutech.insurance_claims_processing_system.repository.*;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdjusterRepository adjusterRepository;
    private final UnderwriterRepository underwriterRepository;
    private final InvestigatorRepository investigatorRepository;
    private final PolicyholderRepository policyholderRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, AdjusterRepository adjusterRepository,
            UnderwriterRepository underwriterRepository, InvestigatorRepository investigatorRepository,
            PolicyholderRepository policyholderRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adjusterRepository = adjusterRepository;
        this.underwriterRepository = underwriterRepository;
        this.investigatorRepository = investigatorRepository;
        this.policyholderRepository = policyholderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        // if (user.getRole().equalsIgnoreCase("ADJUSTER")) {
        // adjusterRepository.save((Adjuster) user);
        // } else if (user.getRole().equalsIgnoreCase("POLICYHOLDER")) {
        // policyholderRepository.save((Policyholder) user);
        // } else if (user.getRole().equalsIgnoreCase("UNDERWRITER")) {
        // underwriterRepository.save((Underwriter) user);
        // } else if (user.getRole().equalsIgnoreCase("INVESTIGATOR")) {
        // investigatorRepository.save((Investigator) user);
        // } else {

        // }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).get();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>());
    }
}
