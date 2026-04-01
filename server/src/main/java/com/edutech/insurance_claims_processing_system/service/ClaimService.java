package com.edutech.insurance_claims_processing_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.insurance_claims_processing_system.entity.Adjuster;
import com.edutech.insurance_claims_processing_system.entity.Claim;
import com.edutech.insurance_claims_processing_system.entity.Policyholder;
import com.edutech.insurance_claims_processing_system.entity.Underwriter;
import com.edutech.insurance_claims_processing_system.repository.AdjusterRepository;
import com.edutech.insurance_claims_processing_system.repository.ClaimRepository;
import com.edutech.insurance_claims_processing_system.repository.PolicyholderRepository;
import com.edutech.insurance_claims_processing_system.repository.UnderwriterRepository;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyholderRepository policyholderRepository;
    private final UnderwriterRepository underwriterRepository;
    private final AdjusterRepository adjusterRepository;

    @Autowired
    public ClaimService(
            ClaimRepository claimRepository,
            PolicyholderRepository policyholderRepository,
            UnderwriterRepository underwriterRepository, AdjusterRepository adjusterRepository) {
        this.claimRepository = claimRepository;
        this.policyholderRepository = policyholderRepository;
        this.underwriterRepository = underwriterRepository;
        this.adjusterRepository = adjusterRepository;
    }

    public Claim createClaim(Claim claim) {
        return claimRepository.save(claim);
    }

    public Claim updateClaim(Long id, Claim claimDetails) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found"));

        claim.setDescription(claimDetails.getDescription());
        claim.setDate(claimDetails.getDate());
        claim.setStatus(claimDetails.getStatus());

        return claimRepository.save(claim);
    }

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public Claim submitClaim(Long policyholderId, Claim claim) {
        Policyholder policyholder = policyholderRepository.findById(policyholderId)
                .orElseThrow(() -> new EntityNotFoundException("Policyholder not found"));
        claim.setPolicyholder(policyholder);
        return claimRepository.save(claim);
    }

    public List<Claim> getClaimsByPolicyholder(Long policyholderId) {
        Policyholder policyholder = policyholderRepository.findById(policyholderId)
                .orElseThrow(() -> new EntityNotFoundException("Policyholder not found"));

        return claimRepository.findByPolicyholder(policyholder);
    }

    public Claim reviewClaim(Long id, String status) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found"));

        claim.setStatus(status);
        return claimRepository.save(claim);
    }

    public List<Claim> getClaimsForReview(Long underwriterId) {
        Underwriter underwriter = underwriterRepository.findById(underwriterId)
                .orElseThrow(() -> new EntityNotFoundException("Underwriter not found"));
        return claimRepository.findByUnderwriter(underwriter);
    }

    public Claim assignClaimToUnderwriter(Long claimId, Long underwriterId, Long adjusterId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found"));

        Underwriter underwriter = underwriterRepository.findById(underwriterId)
                .orElseThrow(() -> new EntityNotFoundException("Underwriter not found"));

        Adjuster adjuster = adjusterRepository.findById(adjusterId)
                .orElseThrow(() -> new EntityNotFoundException("Adjuster not found"));
        claim.setStatus("In progress");
        claim.setUnderwriter(underwriter);
        claim.setAdjuster(adjuster);
        return claimRepository.save(claim);
    }
}
