package com.edutech.insurance_claims_processing_system.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.edutech.insurance_claims_processing_system.entity.User;
import com.edutech.insurance_claims_processing_system.repository.UserRepository;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    
}