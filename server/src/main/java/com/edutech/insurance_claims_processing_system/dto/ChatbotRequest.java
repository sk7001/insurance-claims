package com.edutech.insurance_claims_processing_system.dto;

public class ChatbotRequest {
    private Long policyholderId;
    private String message;

    public Long getPolicyholderId() {
        return policyholderId;
    }

    public void setPolicyholderId(Long policyholderId) {
        this.policyholderId = policyholderId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}