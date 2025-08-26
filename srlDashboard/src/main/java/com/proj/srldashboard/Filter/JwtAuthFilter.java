package com.proj.srldashboard.Filter;


import com.proj.srldashboard.Service.CredentialService;
import com.proj.srldashboard.Utility.JwtUtility;
import com.proj.srldashboard.Service.TokenDenylistService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtility jwtUtil;
    private final CredentialService userDetailsService;
    private final TokenDenylistService denylistService;

    public JwtAuthFilter(JwtUtility jwtUtil,
                         CredentialService userDetailsService,
                         TokenDenylistService denylistService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.denylistService = denylistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException, java.io.IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        try {
            Claims claims = jwtUtil.extractAllClaims(jwt);

            if ("analytics".equals(claims.get("tokenType", String.class))) {
                chain.doFilter(request, response);
                return;
            }

            String jti = claims.getId();
            String username = claims.getSubject();

            if (username != null
                    && !denylistService.isTokenDenylisted(jti)
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails user = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            log.warn("JWT authentication failed for {}: {}", request.getRequestURI(), e.getMessage());
        }

        chain.doFilter(request, response);
    }
}
