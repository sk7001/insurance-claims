package com.edutech.insurance_claims_processing_system.dto;

public class ChatbotResponse {
    private String reply;

    public ChatbotResponse() {}

    public ChatbotResponse(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}