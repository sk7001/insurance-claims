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
    private final EmailService emailService;

    @Autowired
    public ClaimService(
            ClaimRepository claimRepository,
            PolicyholderRepository policyholderRepository,
            UnderwriterRepository underwriterRepository,
            AdjusterRepository adjusterRepository,
            EmailService emailService) {

        this.claimRepository = claimRepository;
        this.policyholderRepository = policyholderRepository;
        this.underwriterRepository = underwriterRepository;
        this.adjusterRepository = adjusterRepository;
        this.emailService = emailService;
    }

    /* =========================
       CREATE CLAIM
    ========================= */
    public Claim createClaim(Claim claim) {
        return claimRepository.save(claim);
    }

    /* =========================
       UPDATE CLAIM
    ========================= */
    public Claim updateClaim(Long id, Claim claimDetails) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found"));

        claim.setDescription(claimDetails.getDescription());
        claim.setDate(claimDetails.getDate());
        claim.setStatus(claimDetails.getStatus());

        return claimRepository.save(claim);
    }

    /* =========================
       GET CLAIMS
    ========================= */
    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public List<Claim> getClaimsByPolicyholder(Long policyholderId) {
        Policyholder policyholder = policyholderRepository.findById(policyholderId)
                .orElseThrow(() -> new EntityNotFoundException("Policyholder not found"));

        return claimRepository.findByPolicyholder(policyholder);
    }

    /* =========================
       SUBMIT CLAIM (EMAIL ✅)
    ========================= */
    public Claim submitClaim(Long policyholderId, Claim claim) {
        Policyholder policyholder = policyholderRepository.findById(policyholderId)
                .orElseThrow(() -> new EntityNotFoundException("Policyholder not found"));

        claim.setPolicyholder(policyholder);
        claim.setStatus("Initiated");

        Claim savedClaim = claimRepository.save(claim);

        // Email notification
        emailService.sendSimpleMail(
                policyholder.getEmail(),
                "Claim Submitted Successfully",
                "Dear " + policyholder.getUsername() + ",\n\n" +
                        "Your claim (ID: #" + savedClaim.getId() + ") has been successfully submitted.\n\n" +
                        "Current Status: Initiated\n\n" +
                        "Regards,\nInsurance Claims Team"
        );

        return savedClaim;
    }

    /* =========================
       REVIEW CLAIM (APPROVE / REJECT ✅)
    ========================= */
    public Claim reviewClaim(Long id, String status) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found"));

        claim.setStatus(status);
        Claim updatedClaim = claimRepository.save(claim);

        Policyholder policyholder = claim.getPolicyholder();

        // Email based on status
        if ("Approved".equalsIgnoreCase(status)) {
            emailService.sendSimpleMail(
                    policyholder.getEmail(),
                    "Claim Approved ✅",
                    "Dear " + policyholder.getUsername() + ",\n\n" +
                            "Good news! Your claim (ID: #" + claim.getId() + ") has been APPROVED.\n\n" +
                            "Regards,\nInsurance Claims Team"
            );
        } else if ("Rejected".equalsIgnoreCase(status)) {
            emailService.sendSimpleMail(
                    policyholder.getEmail(),
                    "Claim Rejected ❌",
                    "Dear " + policyholder.getUsername() + ",\n\n" +
                            "We regret to inform you that your claim (ID: #" + claim.getId() + ") has been REJECTED.\n\n" +
                            "Please contact support for more details.\n\n" +
                            "Regards,\nInsurance Claims Team"
            );
        }

        return updatedClaim;
    }

    /* =========================
       CLAIMS FOR REVIEW
    ========================= */
    public List<Claim> getClaimsForReview(Long underwriterId) {
        Underwriter underwriter = underwriterRepository.findById(underwriterId)
                .orElseThrow(() -> new EntityNotFoundException("Underwriter not found"));
        return claimRepository.findByUnderwriter(underwriter);
    }

    /* =========================
       ASSIGN CLAIM (EMAIL ✅)
    ========================= */
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

        Claim updatedClaim = claimRepository.save(claim);

        // Email notification to policyholder
        emailService.sendSimpleMail(
                claim.getPolicyholder().getEmail(),
                "Claim Assigned for Review",
                "Dear " + claim.getPolicyholder().getUsername() + ",\n\n" +
                        "Your claim (ID: #" + claim.getId() + ") is now being reviewed.\n\n" +
                        "Assigned Underwriter: " + underwriter.getUsername() + "\n\n" +
                        "Status:" + claim.getStatus() + "\n\n" +
                        "Regards,\nInsurance Claims Team"
        );

        return updatedClaim;
    }
}