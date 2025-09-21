package com.proj.srlanalytics.Utility;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class AnalyticsJwtValidator {

    @Value("${jwt.secret}")
    private String secretString;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isAnalyticsToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "analytics".equals(claims.get("tokenType", String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractUserTag(String token) {
        try {
            return extractAllClaims(token).get("userTag", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
