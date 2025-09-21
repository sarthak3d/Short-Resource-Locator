package com.proj.srlanalytics.Filter;

import com.proj.srlanalytics.Utility.AnalyticsJwtValidator;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class AnalyticsTokenFilter extends OncePerRequestFilter {

    private final AnalyticsJwtValidator validator;

    public AnalyticsTokenFilter(AnalyticsJwtValidator validator) {
        this.validator = validator;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (validator.isAnalyticsToken(token)) {
                    String userTag = validator.extractUserTag(token);
                    if (userTag != null && !userTag.isBlank()) {
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userTag, null,
                                        List.of(new SimpleGrantedAuthority("ROLE_ANALYTICS")));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception e) {
                // Invalid token — SecurityContext remains null; Spring Security returns 403
            }
        }
        chain.doFilter(request, response);
    }
}
