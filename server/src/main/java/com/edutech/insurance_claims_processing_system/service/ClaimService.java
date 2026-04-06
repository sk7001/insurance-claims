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

        /*
         * =========================
         * CREATE CLAIM
         * =========================
         */
        public Claim createClaim(Claim claim) {
                return claimRepository.save(claim);
        }

        /*
         * =========================
         * UPDATE CLAIM
         * =========================
         */
        public Claim updateClaim(Long id, Claim claimDetails) {
                Claim claim = claimRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Claim not found"));

                claim.setDescription(claimDetails.getDescription());
                claim.setDate(claimDetails.getDate());
                claim.setStatus(claimDetails.getStatus());

                return claimRepository.save(claim);
        }

        /*
         * =========================
         * GET CLAIMS
         * =========================
         */
        public List<Claim> getAllClaims() {
                return claimRepository.findAll();
        }

        public List<Claim> getClaimsByPolicyholder(Long policyholderId) {
                Policyholder policyholder = policyholderRepository.findById(policyholderId)
                                .orElseThrow(() -> new EntityNotFoundException("Policyholder not found"));

                return claimRepository.findByPolicyholder(policyholder);
        }

        /*
         * =========================
         * SUBMIT CLAIM (EMAIL ✅)
         * =========================
         */
        public Claim submitClaim(Long policyholderId, Claim claim) {
                Policyholder policyholder = policyholderRepository.findById(policyholderId)
                                .orElseThrow(() -> new EntityNotFoundException("Policyholder not found"));

                claim.setPolicyholder(policyholder);
                claim.setStatus("Initiated");

                Claim savedClaim = claimRepository.save(claim);

                // Email notification
                emailService.sendClaimNotification(
                                policyholder.getEmail(),
                                policyholder.getUsername(),
                                "Claim Submitted Successfully ✅",
                                "Your new insurance claim has been received. Our team will begin the evaluation shortly.",
                                savedClaim.getId(),
                                savedClaim.getInsuranceType(),
                                savedClaim.getDate() != null ? savedClaim.getDate().toString() : "N/A",
                                savedClaim.getStatus(),
                                savedClaim.getDescription(),
                                null);

                return savedClaim;
        }

        /*
         * =========================
         * REVIEW CLAIM (APPROVE / REJECT ✅)
         * =========================
         */
        public Claim reviewClaim(Long id, String status) {
                Claim claim = claimRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Claim not found"));

                claim.setStatus(status);
                Claim updatedClaim = claimRepository.save(claim);

                Policyholder policyholder = claim.getPolicyholder();

                // Email based on status
                if ("Approved".equalsIgnoreCase(status)) {
                        emailService.sendClaimNotification(
                                        policyholder.getEmail(),
                                        policyholder.getUsername(),
                                        "Claim Approved ✅",
                                        "Congratulations! Your claim has been approved for processing.",
                                        claim.getId(),
                                        claim.getInsuranceType(),
                                        claim.getDate() != null ? claim.getDate().toString() : "N/A",
                                        "Approved",
                                        claim.getDescription(),
                                        "Our disbursement team will contact you regarding the next steps.");
                } else if ("Rejected".equalsIgnoreCase(status)) {
                        emailService.sendClaimNotification(
                                        policyholder.getEmail(),
                                        policyholder.getUsername(),
                                        "Claim Rejected ❌",
                                        "We regret to inform you that your claim could not be approved at this time.",
                                        claim.getId(),
                                        claim.getInsuranceType(),
                                        claim.getDate() != null ? claim.getDate().toString() : "N/A",
                                        "Rejected",
                                        claim.getDescription(),
                                        "Please check your portal for the full reason or contact support for an appeal.");
                }

                return updatedClaim;
        }

        /*
         * =========================
         * CLAIMS FOR REVIEW
         * =========================
         */
        public List<Claim> getClaimsForReview(Long underwriterId) {
                Underwriter underwriter = underwriterRepository.findById(underwriterId)
                                .orElseThrow(() -> new EntityNotFoundException("Underwriter not found"));
                return claimRepository.findByUnderwriter(underwriter);
        }

        /*
         * =========================
         * ASSIGN CLAIM (EMAIL ✅)
         * =========================
         */
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
                String staffNotes = "We have assigned a specialized team to your claim:<br/>"
                                + "<strong>Underwriter:</strong> " + underwriter.getFullName() + "<br/>"
                                + "<strong>Adjuster:</strong> " + adjuster.getFullName();

                emailService.sendClaimNotification(
                                claim.getPolicyholder().getEmail(),
                                claim.getPolicyholder().getUsername(),
                                "Claim Assigned for Review 📋",
                                "Your claim is now being actively reviewed by our specialized staff.",
                                claim.getId(),
                                claim.getInsuranceType(),
                                claim.getDate() != null ? claim.getDate().toString() : "N/A",
                                "Under Review",
                                claim.getDescription(),
                                staffNotes);

                // Email notification to underwriter
                String uwNotes = "A new claim requires your underwriting expertise.<br/>"
                                + "<strong>Policyholder:</strong> " + claim.getPolicyholder().getFullName() + "<br/>"
                                + "<strong>Phone:</strong> " + claim.getPolicyholder().getPhoneNumber();

                emailService.sendClaimNotification(
                                underwriter.getEmail(),
                                underwriter.getUsername(),
                                "Task Assigned: New Claim Review 📋",
                                "You have a new claim assignment that requires your attention.",
                                claim.getId(),
                                claim.getInsuranceType(),
                                claim.getDate() != null ? claim.getDate().toString() : "N/A",
                                "Under Review",
                                claim.getDescription(),
                                uwNotes);

                return updatedClaim;
        }
}