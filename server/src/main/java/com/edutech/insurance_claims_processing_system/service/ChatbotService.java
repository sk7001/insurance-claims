package com.edutech.insurance_claims_processing_system.service;
import java.util.*;
import org.springframework.stereotype.Service;
import com.edutech.insurance_claims_processing_system.entity.Claim;
import com.edutech.insurance_claims_processing_system.service.GeminiService;
import com.edutech.insurance_claims_processing_system.repository.PolicyholderRepository;
import com.edutech.insurance_claims_processing_system.entity.Policyholder;
import com.edutech.insurance_claims_processing_system.dto.ChatbotResponse;
import com.edutech.insurance_claims_processing_system.dto.ChatbotRequest;

@Service
public class ChatbotService {

    private final GeminiService geminiService;
    private final ClaimService claimService;
    private final PolicyholderRepository policyholderRepository;

    public ChatbotService(GeminiService geminiService,
                          ClaimService claimService,
                          PolicyholderRepository policyholderRepository) {
        this.geminiService = geminiService;
        this.claimService = claimService;
        this.policyholderRepository = policyholderRepository;
    }

    public ChatbotResponse handle(Long policyholderId, String message) {

        // ✅ FIRST MESSAGE = CONTEXT BUILD
        if ("__INIT__".equals(message)) {
            String contextPrompt = buildInitialContext(policyholderId);
            String aiReply = geminiService.generateText(contextPrompt);

            return new ChatbotResponse(aiReply);
        }

        // ✅ NORMAL QUESTION
        String prompt =
                buildInitialContext(policyholderId)
                + "\n\nUser question:\n"
                + message;

        String aiReply = geminiService.generateText(prompt);
        return new ChatbotResponse(aiReply);
    }

    // ✅ BUILD CONTEXT PROMPT (ONLY ON CLICK)
    private String buildInitialContext(Long policyholderId) {

        Policyholder p = policyholderRepository.findById(policyholderId).orElse(null);
        List<Claim> claims = claimService.getClaimsByPolicyholder(policyholderId);

        StringBuilder sb = new StringBuilder();
        sb.append("You are a helpful insurance claim assistant.\n\n");

        if (p != null) {
            sb.append("Policyholder Details:\n");
            sb.append("Name: ").append(p.getUsername()).append("\n");
            sb.append("Email: ").append(p.getEmail()).append("\n\n");
        }

        sb.append("Claims Raised by Policyholder:\n");

        if (claims == null || claims.isEmpty()) {
            sb.append("No claims found.\n");
        } else {
            for (Claim c : claims) {
                sb.append("Claim ID: ").append(c.getId())
                        .append(", Type: ").append(c.getInsuranceType())
                        .append(", Status: ").append(c.getStatus())
                        .append(", Date: ").append(c.getDate())
                        .append("\n");
            }
        }

        sb.append("\nYou must answer questions ONLY based on the above data.\n");
        sb.append("If user asks unrelated questions, politely say you can help with claims.");

        return sb.toString();
    }
}