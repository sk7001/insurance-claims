package com.edutech.insurance_claims_processing_system.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendGenericHtmlMail(String to, String subject, String name, String contentHtml) {
        try {
            if (to == null || to.isEmpty()) return;

            javax.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("InsureCo <insure.co.customer@gmail.com>");
            helper.setTo(to);
            helper.setSubject(subject);

            String htmlBody = "<div style=\"font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #03050a; color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);\">"
                + "  <div style=\"padding: 30px; text-align: center; border-bottom: 1px solid #1a1f33;\">"
                + "    <h1 style=\"color: #e63350; margin: 0; font-weight: 800; letter-spacing: 2px;\">InsureCo</h1>"
                + "  </div>"
                + "  <div style=\"padding: 40px 30px; background-color: #0d0d1a;\">"
                + "    <h2 style=\"margin-top: 0; color: #ffffff;\">Hello " + (name != null ? name : "User") + ",</h2>"
                + "    <p style=\"color: #a0a5b5; line-height: 1.6; font-size: 16px;\">" + contentHtml + "</p>"
                + "  </div>"
                + "  <div style=\"padding: 20px; text-align: center; font-size: 12px; color: #4a5568;\">"
                + "    &copy; " + java.time.Year.now().getValue() + " InsureCo. All rights reserved."
                + "  </div>"
                + "</div>";

            helper.setText(htmlBody, true);
            mailSender.send(message);

        } catch (Exception e) {
            System.out.println("Generic HTML Email failed: " + e.getMessage());
        }
    }

    @Async
    public void sendVerificationHtmlMail(String to, String name, String token) {
        try {
            if (to == null || to.isEmpty()) return;

            javax.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("InsureCo <insure.co.customer@gmail.com>");
            helper.setTo(to);
            helper.setSubject("Verify your InsureCo Account");

            String verifyUrl = "https://orchardsolve.lntedutech.com/project/1395/proxy/3000/api/user/verify?token=" + token;

            String htmlBody = "<div style=\"font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #03050a; color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);\">"
                + "  <div style=\"padding: 30px; text-align: center; border-bottom: 1px solid #1a1f33;\">"
                + "    <h1 style=\"color: #e63350; margin: 0; font-weight: 800; letter-spacing: 2px;\">InsureCo</h1>"
                + "  </div>"
                + "  <div style=\"padding: 40px 30px; background-color: #0d0d1a;\">"
                + "    <h2 style=\"margin-top: 0; color: #ffffff;\">Welcome " + (name != null ? name : "User") + ",</h2>"
                + "    <p style=\"color: #a0a5b5; line-height: 1.6; font-size: 16px;\">Thank you for registering with InsureCo, the next-generation insurance claims platform. Please verify your email address to activate your account and gain access to your dashboard.</p>"
                + "    <div style=\"text-align: center; margin: 40px 0;\">"
                + "      <a href=\"" + verifyUrl + "\" style=\"background-color: #e63350; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; display: inline-block;\">Verify Email Address</a>"
                + "    </div>"
                + "    <p style=\"color: #a0a5b5; font-size: 14px;\">If the button doesn't work, copy and paste this link into your browser:</p>"
                + "    <p style=\"color: #64748b; font-size: 13px; word-break: break-all;\">" + verifyUrl + "</p>"
                + "  </div>"
                + "  <div style=\"padding: 20px; text-align: center; font-size: 12px; color: #4a5568;\">"
                + "    &copy; " + java.time.Year.now().getValue() + " InsureCo. All rights reserved."
                + "  </div>"
                + "</div>";

            helper.setText(htmlBody, true);
            mailSender.send(message);

        } catch (Exception e) {
            System.out.println("HTML Email failed: " + e.getMessage());
        }
    }
}