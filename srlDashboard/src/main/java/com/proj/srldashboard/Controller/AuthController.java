package com.proj.srldashboard.Controller;

import com.proj.srldashboard.Model.*;
import com.proj.srldashboard.Service.CredentialService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final CredentialService credservice;

    public AuthController(CredentialService credservice) {
        this.credservice = credservice;
    }

    @PostMapping("signup/email")
    public ResponseEntity<?> sendEmailCode(@RequestBody Message email) {
        return credservice.sendEmailCode(email.getMessage());
    }

    @PostMapping("signup/email/verify")
    public ResponseEntity<?> verifyEmailCode(@RequestBody AuthRequest code) {
        return credservice.verifyEmailCode(code.getIdentifier(), code.getPasscode());
    }

    @PostMapping("signup/credentials")
    public ResponseEntity<?> setCredentials(@RequestBody CredRequest cred) {
        return credservice.setCredentials(cred);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        return credservice.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        return credservice.logout(request);
    }

    @PatchMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request,
            @AuthenticationPrincipal UserDetails userdetails) {
        List<String> errors;
        try {
            errors = credservice.changePassword(request, userdetails.getUsername());
        } catch (RuntimeException re) {
            return ResponseEntity.badRequest().body(re.getMessage());
        }
        if (errors.isEmpty()) {
            return ResponseEntity.ok("Password updated successfully");
        } else {
            return ResponseEntity.badRequest().body(errors);
        }
    }

    @PostMapping("forget-password")
    public ResponseEntity<?> forgetPassword(@RequestBody Message request) {
        return credservice.forgetPassword(request.getMessage());
    }

    @PostMapping("reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request) {
        return credservice.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
    }
}
