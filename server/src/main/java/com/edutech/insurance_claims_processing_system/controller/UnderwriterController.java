package com.edutech.insurance_claims_processing_system.controller;

import com.edutech.insurance_claims_processing_system.entity.Claim;
import com.edutech.insurance_claims_processing_system.service.ClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/underwriter")
public class UnderwriterController {

    @Autowired
    private ClaimService claimService;

    @GetMapping("/claims")
    public ResponseEntity<List<Claim>> getClaimsForReview(
            @RequestParam Long underwriterId) {
        List<Claim> claims = claimService.getClaimsForReview(underwriterId);
        return ResponseEntity.ok(claims);
    }

    @PutMapping("/claim/{id}/review")
    public ResponseEntity<Claim> reviewClaim(
            @PathVariable Long id,
            @RequestParam String status) {
        Claim updatedClaim = claimService.reviewClaim(id, status);
        return ResponseEntity.ok(updatedClaim);
    }
}