package com.proj.srldashboard.Repository;

import com.proj.srldashboard.Model.User;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

@Repository
public class CacheRepository{

    private static final String VERIFICATION_CODE_PREFIX = "verification-code:";
    private static final String TEMP_USER_PREFIX = "temp-user:";
    private static final long CODE_TTL_MINUTES = 10;
    private static final long USER_TTL_MINUTES = 10;

    private final RedisTemplate<String, Object> redisTemplate;

    public CacheRepository(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void addCode(String email,String code) {
        redisTemplate.opsForValue().set(VERIFICATION_CODE_PREFIX + email, code, CODE_TTL_MINUTES, TimeUnit.MINUTES);
    }

    public String getCode(String email) {
        return (String) redisTemplate.opsForValue().get(VERIFICATION_CODE_PREFIX + email);
    }

    public void deleteCode(String email) {
        redisTemplate.delete(VERIFICATION_CODE_PREFIX + email);
    }

    public void addUser(String email, User user) {
        redisTemplate.opsForValue().set(TEMP_USER_PREFIX + email, user, USER_TTL_MINUTES, TimeUnit.MINUTES);
    }

    public User getUser(String email) {
        return (User)redisTemplate.opsForValue().get(TEMP_USER_PREFIX + email);
    }
    public void deleteUser(String email) {
        redisTemplate.delete(TEMP_USER_PREFIX + email);
    }
}
