package com.edutech.insurance_claims_processing_system.controller;

import com.edutech.insurance_claims_processing_system.entity.Claim;
import com.edutech.insurance_claims_processing_system.entity.Policyholder;
import com.edutech.insurance_claims_processing_system.repository.PolicyholderRepository;
import com.edutech.insurance_claims_processing_system.service.ClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policyholder")
public class PolicyholderController {

    @Autowired
    private ClaimService claimService;

    @Autowired
    private PolicyholderRepository policyholderRepository;

    @PostMapping("/claim")
    public ResponseEntity<Claim> submitClaim(
            @RequestParam Long policyholderId,
            @RequestBody Claim claim) {
        Claim submitted = claimService.submitClaim(policyholderId, claim);
        return ResponseEntity.ok(submitted);
    }

    @GetMapping("/claims")
    public ResponseEntity<List<Claim>> getClaims(@RequestParam Long policyholderId) {
        List<Claim> claims = claimService.getClaimsByPolicyholder(policyholderId);
        return ResponseEntity.ok(claims);
    }
}