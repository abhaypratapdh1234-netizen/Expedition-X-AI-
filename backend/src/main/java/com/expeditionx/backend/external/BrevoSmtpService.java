package com.expeditionx.backend.external;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

@Service
public class BrevoSmtpService {

    private static final Logger log = LoggerFactory.getLogger(BrevoSmtpService.class);

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;

    public BrevoSmtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String text) {
        if (fromEmail == null || fromEmail.isEmpty()) {
            log.warn("SMTP not configured. Mock sending email to {}: {}", to, subject);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            log.info("DEVELOPMENT FALLBACK: Since email failed, here is the message body for {}:\n\n{}\n", to, text);
        }
    }
}
