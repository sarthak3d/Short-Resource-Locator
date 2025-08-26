package com.proj.srldashboard.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
public class TokenDenylistService {

    private static final Logger log = LoggerFactory.getLogger(TokenDenylistService.class);

    private final Cache denylistCache;

    public TokenDenylistService(CacheManager cacheManager) {
        this.denylistCache = cacheManager.getCache("denylistedTokens");
        if (this.denylistCache == null) {
            throw new IllegalStateException(
                    "Cache 'denylistedTokens' not found. Ensure it is configured in CacheConfig.");
        }
    }

    public void denylistToken(String jti) {
        try {
            denylistCache.put(jti, "denylisted");
        } catch (Exception e) {
            log.warn("Failed to denylist token jti={}: {}", jti, e.getMessage());
        }
    }

    public boolean isTokenDenylisted(String jti) {
        try {
            return denylistCache.get(jti) != null;
        } catch (Exception e) {
            log.warn("Denylist lookup failed for jti={}, allowing token: {}", jti, e.getMessage());
            return false;
        }
    }
}