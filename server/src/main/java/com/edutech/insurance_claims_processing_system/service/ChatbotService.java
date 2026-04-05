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

        // 🛡️ SECURITY CHECK: Only allow true Policyholders
        if (!policyholderRepository.existsById(policyholderId)) {
            return new ChatbotResponse("I am **Nexus AI**, the dedicated specialist for Edutech Policyholders. I am only available for policyholders with an active account.");
        }

        // ✅ FIRST MESSAGE = DETERMINISTIC GREETING (No AI variance)
        if ("__INIT__".equals(message)) {
            String greeting = buildStaticGreeting(policyholderId);
            return new ChatbotResponse(greeting);
        }

        // ✅ NORMAL QUESTION (Strict AI adherence)
        String prompt = buildInitialContext(policyholderId)
                + "\n\nUser question:\n"
                + message;

        String aiReply = geminiService.generateText(prompt);
        return new ChatbotResponse(aiReply);
    }

    // ✅ BUILD STATIC GREETING (Ensures consistency)
    private String buildStaticGreeting(Long policyholderId) {
        Policyholder p = policyholderRepository.findById(policyholderId).orElse(null);
        List<Claim> claims = claimService.getClaimsByPolicyholder(policyholderId);

        String name = (p != null) ? p.getUsername() : "there";
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(name).append(", I am **Nexus AI**, your dedicated insurance claims specialist.\n\n");
        sb.append("I have access to your profile and current claims list. ");

        if (claims == null || claims.isEmpty()) {
            sb.append("You currently have **no active claims** on file.");
        } else {
            sb.append("You have **").append(claims.size()).append("** claim(s) on file.");
        }

        sb.append("\n\nHow can I help you regarding your claims today?");
        return sb.toString();
    }

    // ✅ BUILD CONTEXT PROMPT (Ultra-Strict Guardrails)
    private String buildInitialContext(Long policyholderId) {
        Policyholder p = policyholderRepository.findById(policyholderId).orElse(null);
        List<Claim> claims = claimService.getClaimsByPolicyholder(policyholderId);

        StringBuilder sb = new StringBuilder();

        // 1. SYSTEM IDENTITIY & ULTRA-STRICT GUARDRAILS
        sb.append("### SYSTEM INSTRUCTIONS (MANDATORY) ###\n");
        sb.append(
                "You are 'Nexus AI', a highly professional, factual, and strictly regulated insurance assistant for Edutech Insurance.\n\n");

        sb.append("### ALLOWED TOPICS ###\n");
        sb.append("1. **EXISTING DATA**: Summarizing and explaining the claims and profile data provided below.\n");
        sb.append(
                "2. **PORTAL NAVIGATION**: Guiding users on how to use the portal (e.g., how to raise a claim, how to update profile).\n");
        sb.append(
                "3. **INSURANCE PROCESS**: Explaining general insurance terminology and the claim lifecycle (Initiated -> In Progress -> Approved/Rejected).\n\n");

        sb.append("### PORTAL FEATURES (FOR NAVIGATION GUIDANCE) ###\n");
        sb.append(
                "- **Create Claim**: Users can raise a new claim via the '+ Create Claim' button on the Dashboard or via the sidebar.\n");
        sb.append("- **View Claims**: Users can track history in the 'View Claim' section.\n");
        sb.append("- **Profile**: Users can update their personal details in the 'Profile' section.\n\n");

        sb.append("### HARD RESTRICTIONS - DO NOT DEVIATE ###\n");
        sb.append(
                "1. **TOPIC LIMIT**: Strictly stick to the Allowed Topics above. Do not discuss unrelated subjects (politics, entertainment, etc.).\n");
        sb.append(
                "2. **NO CODE**: You MUST NOT provide code snippets, technical implementation details, scripts, or engineering advice of any kind.\n");
        sb.append(
                "3. **OFF-TOPIC DECLINE**: For any question unrelated to insurance or this portal, politely state your purpose as a claims specialist.\n");
        sb.append(
                "4. **NO LEGAL/FINANCIAL ADVICE**: For legal/financial guidance, suggest consulting a certified professional.\n");
        sb.append("5. **DETERMINISM**: Be direct and factual.\n\n");

        // 2. USER CONTEXT
        sb.append("### CURRENT USER CONTEXT ###\n");
        if (p != null) {
            sb.append("- Name: ").append(p.getUsername()).append("\n");
            sb.append("- Email: ").append(p.getEmail()).append("\n");
        }

        // 3. CLAIM DATA
        sb.append("### ACTIVE CLAIMS DATA ###\n");
        if (claims == null || claims.isEmpty()) {
            sb.append("Zero claims found for this user.\n");
        } else {
            for (Claim c : claims) {
                sb.append("- CLAIM #").append(c.getId())
                        .append(" [ ").append(c.getInsuranceType()).append("]")
                        .append(" | Status: ").append(c.getStatus())
                        .append(" | Date: ").append(c.getDate())
                        .append("\n");
            }
        }

        sb.append("\n### FINAL DIRECTIVE ###\n");
        sb.append("Maintain the Nexus AI persona. Be helpful by using BOTH the user data provided AND your knowledge of the Portal Features. ");
        sb.append("If a user wants to raise or create a claim, enthusiastically guide them to the 'Create Claim' button on the sidebar. ");
        sb.append("Do not say you cannot assist; instead, be their guide to the portal's tools.");

        return sb.toString();
    }
}