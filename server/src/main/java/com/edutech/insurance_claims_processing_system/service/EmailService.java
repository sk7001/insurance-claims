package com.edutech.insurance_claims_processing_system.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ✅ ASYNC = email runs in background
    @Async
    public void sendSimpleMail(String to, String subject, String body) {

        try {
            if (to == null || to.isEmpty()) return;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

        } catch (Exception e) {
            // ✅ do NOT fail your API even if email fails
            System.out.println("Email failed: " + e.getMessage());
        }
    }
}