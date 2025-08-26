package com.proj.srldashboard.Service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final Resend resend;
    private final String fromAddress;

    public EmailService(@Value("${resend.api-key}") String apiKey, 
                        @Value("${resend.from-address}") String fromAddress) {
        this.resend = new Resend(apiKey);
        this.fromAddress = fromAddress;
    }

    public void sendVerificationCode(String toEmail, String code) throws ResendException {
        String html = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p>Dear User,</p>
                <p>Please use the following verification code:</p>
                <h2 style="color: #2E86C1; font-size: 24px;">%s</h2>
                <p>This code will expire in <b>10 minutes</b>.</p>
                <p>If you did not initiate this request, please ignore this email.</p>
                <br/>
                <p>Best regards,</p>
            </body>
            </html>
            """, code);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromAddress)
                .to(toEmail)
                .subject("Email Verification Code")
                .html(html)
                .build();

        resend.emails().send(params);
    }
}
