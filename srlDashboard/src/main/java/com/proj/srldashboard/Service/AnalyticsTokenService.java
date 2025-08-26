package com.proj.srldashboard.Service;

import com.proj.srldashboard.Model.AnalyticsTokenResponse;
import com.proj.srldashboard.Model.Message;
import com.proj.srldashboard.Model.User;
import com.proj.srldashboard.Repository.UserRepository;
import com.proj.srldashboard.Utility.JwtUtility;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AnalyticsTokenService {

    private final UserRepository userRepository;
    private final JwtUtility jwtUtil;

    public AnalyticsTokenService(UserRepository userRepository, JwtUtility jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> generateAnalyticsToken(String username) {
        Optional<User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isEmpty() || !optionalUser.get().isSubmitted()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Message("User profile not complete. Submit user details first."));
        }

        String userTag = optionalUser.get().getUserTag();
        if (userTag == null || userTag.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Message("User tag not set."));
        }

        String token = jwtUtil.generateAnalyticsToken(username, userTag);
        return ResponseEntity.ok(new AnalyticsTokenResponse(token, 1800));
    }
}
