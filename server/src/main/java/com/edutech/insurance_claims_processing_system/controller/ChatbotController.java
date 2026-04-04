package com.edutech.insurance_claims_processing_system.controller;

import org.springframework.web.bind.annotation.*;

import com.edutech.insurance_claims_processing_system.service.ChatbotService;
import com.edutech.insurance_claims_processing_system.dto.ChatbotResponse;
import com.edutech.insurance_claims_processing_system.dto.ChatbotRequest;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/message")
    public ChatbotResponse message(@RequestBody ChatbotRequest req) {
        return chatbotService.handle(req.getPolicyholderId(), req.getMessage());
    }
}