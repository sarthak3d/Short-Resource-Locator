package com.proj.srldashboard.Controller;

import com.proj.srldashboard.Service.AnalyticsTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
public class AnalyticsTokenController {

    private final AnalyticsTokenService analyticsTokenService;

    public AnalyticsTokenController(AnalyticsTokenService analyticsTokenService) {
        this.analyticsTokenService = analyticsTokenService;
    }

    @PostMapping("/token")
    public ResponseEntity<?> getAnalyticsToken(@AuthenticationPrincipal UserDetails userDetails) {
        return analyticsTokenService.generateAnalyticsToken(userDetails.getUsername());
    }
}
