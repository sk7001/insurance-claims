package com.edutech.insurance_claims_processing_system.controller;

import com.edutech.insurance_claims_processing_system.entity.Claim;
import com.edutech.insurance_claims_processing_system.entity.Underwriter;
import com.edutech.insurance_claims_processing_system.repository.UnderwriterRepository;
import com.edutech.insurance_claims_processing_system.service.ClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adjuster")
public class AdjusterController {

    @Autowired
    private ClaimService claimService;

    @Autowired
    private UnderwriterRepository underwriterRepository;

    @PutMapping("/claim/{id}")
    public ResponseEntity<Claim> updateClaim(@PathVariable Long id,
            @RequestBody Claim claimDetails) {

        Claim updated = claimService.updateClaim(id, claimDetails);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/claims")
    public List<Claim> getAllClaims() {
        return claimService.getAllClaims();
    }

    @GetMapping("/underwriters")
    public List<Underwriter> getAllUnderwriters() {
        return underwriterRepository.findAll();
    }

    @PutMapping("/claim/{claimId}/assign")
    public ResponseEntity<Claim> assignClaimToUnderwriter(
            @PathVariable Long claimId,
            @RequestParam Long underwriterId,
            @RequestParam Long adjusterId) {
        Claim updated = claimService.assignClaimToUnderwriter(claimId, underwriterId, adjusterId);
        return ResponseEntity.ok(updated);
    }
}