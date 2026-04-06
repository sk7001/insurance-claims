package com.edutech.insurance_claims_processing_system.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${app.project.id}")
    private String projectId;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private String generateEmailHtml(String title, String name, String body, String ctaText, String ctaUrl) {
        String ctaButton = (ctaText != null && ctaUrl != null) ? 
            "<div style='text-align: center; margin: 30px 0;'><a href='" + ctaUrl + "' style='background-color: #e63350; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;'>" + ctaText + "</a></div>" : "";

        return "<div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1f33; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;\">"
             + "  <div style=\"padding: 24px; text-align: center; background-color: #03050a; border-bottom: 4px solid #e63350;\">"
             + "    <h1 style=\"color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 2px;\">InsureCo</h1>"
             + "  </div>"
             + "  <div style=\"padding: 35px; background-color: #ffffff;\">"
             + "    <h2 style=\"color: #03050a; margin-top: 0;\">" + title + "</h2>"
             + "    <p>Hello " + (name != null ? name : "User") + ",</p>"
             + "    <div style=\"line-height: 1.6;\">" + body + "</div>"
             + "    " + ctaButton
             + "  </div>"
             + "  <div style=\"padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f8fafc;\">"
             + "    &copy; " + java.time.Year.now().getValue() + " InsureCo. All rights reserved."
             + "  </div>"
             + "</div>";
    }

    private void sendMail(String to, String subject, String html) {
        try {
            if (to == null || to.isEmpty()) return;
            javax.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper h = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            h.setFrom("InsureCo <insure.co.customer@gmail.com>");
            h.setTo(to);
            h.setSubject(subject);
            h.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) { System.err.println("Email Delivery Error: " + e.getMessage()); }
    }

    @Async
    public void sendVerificationHtmlMail(String to, String name, String token) {
        String url = "https://orchardsolve.lntedutech.com/project/" + projectId + "/proxy/3000/api/user/verify?token=" + token;
        String body = "Welcome to InsureCo! Please verify your email to activate your account and start managing your claims.";
        sendMail(to, "Activate Your InsureCo Account 🛡️", generateEmailHtml("Account Activation", name, body, "Verify Email Address", url));
    }

    @Async
    public void sendClaimNotification(String to, String recipientName, String subject, String header, 
                                    Long claimId, String type, String date, String status, String description, String additionalInfo) {
        
        String statusColor = "#e63350"; // Default red
        if ("Approved".equalsIgnoreCase(status) || "Active".equalsIgnoreCase(status)) statusColor = "#16a34a"; // Green
        if ("In progress".equalsIgnoreCase(status) || "Under Review".equalsIgnoreCase(status)) statusColor = "#3b82f6"; // Blue

        String summaryBlock = "<div style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;\">"
             + "  <table style=\"width: 100%; border-collapse: collapse; font-size: 14px;\">"
             + "    <tr><td style=\"padding: 8px 0; color: #64748b; width: 140px;\">Reference #</td><td style=\"padding: 8px 0; font-weight: bold;\">#" + claimId + "</td></tr>"
             + "    <tr><td style=\"padding: 8px 0; color: #64748b;\">Insurance Type</td><td style=\"padding: 8px 0; font-weight: bold;\">" + type + "</td></tr>"
             + "    <tr><td style=\"padding: 8px 0; color: #64748b;\">Submission Date</td><td style=\"padding: 8px 0; font-weight: bold;\">" + date + "</td></tr>"
             + "    <tr><td style=\"padding: 8px 0; color: #64748b;\">Current Status</td><td style=\"padding: 8px 0; font-weight: bold; color: " + statusColor + ";\">" + status + "</td></tr>"
             + "  </table>"
             + "</div>";

        String descBlock = (description != null && !description.isEmpty()) ? 
            "<div style=\"border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px;\">" +
            "  <strong style=\"display: block; margin-bottom: 8px;\">Claim Description:</strong>" +
            "  <p style=\"color: #475569; margin: 0; font-style: italic;\">\"" + description + "\"</p>" +
            "</div>" : "";

        String addBlock = (additionalInfo != null && !additionalInfo.isEmpty()) ?
            "<div style=\"background-color: #fff9f9; border-left: 4px solid #e63350; padding: 15px; margin-top: 25px; color: #7f1d1d; font-size: 14px;\">" +
            "  <strong>Important Note:</strong><br/>" + additionalInfo +
            "</div>" : "";

        String body = "<p>" + header + "</p>" + summaryBlock + descBlock + addBlock;
        String url = "https://orchardsolve.lntedutech.com/project/" + projectId + "/proxy/5000/login";
        
        sendMail(to, subject, generateEmailHtml(subject, recipientName, body, "View Detailed Status", url));
    }

    @Async
    public void sendOtpMail(String to, String name, String otp) {
        String body = "Your security verification code is: <br/><br/>" +
                      "<div style=\"text-align: center; background: #f1f5f9; padding: 20px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e63350;\">" + otp + "</div><br/>" +
                      "This code will expire in 5 minutes. If you did not request this, please contact support.";
        sendMail(to, "Your Security Verification Code 🛡️", generateEmailHtml("Security Code", name, body, null, null));
    }

    @Async
    public void sendGenericHtmlMail(String to, String subject, String name, String contentHtml) {
        sendMail(to, subject, generateEmailHtml(subject, name, contentHtml, null, null));
    }

}