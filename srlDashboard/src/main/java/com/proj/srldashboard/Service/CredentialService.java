package com.proj.srldashboard.Service;


import com.proj.srldashboard.Model.*;
import com.proj.srldashboard.Repository.CacheRepository;
import com.proj.srldashboard.Repository.CredentialRepository;
import com.proj.srldashboard.Repository.UserRepository;
import com.proj.srldashboard.Utility.JwtUtility;
import com.proj.srldashboard.Utility.PasswordValidatorUtility;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import com.resend.core.exception.ResendException;

@Service
public class CredentialService implements UserDetailsService {

    private final AuthenticationManager authManager;
    private final CredentialRepository credentialRepository;
    private final EmailService emailservice;
    private final CacheRepository cacherepo;
    private final UserRepository userrepo;
    private final JwtUtility jwtUtil;
    private final PasswordEncoder encoder;
    private final TokenDenylistService denylistService;

    private static final Pattern VALID_EMAIL_ADDRESS_REGEX =
            Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);


    public CredentialService(@Lazy AuthenticationManager authManager, CredentialRepository credentialRepository,
                             EmailService emailservice,
                             CacheRepository cacherepo,
                             UserRepository userrepo,
                             JwtUtility jwtUtil,
                             @Lazy PasswordEncoder encoder,
                             TokenDenylistService denylistService)
    {
        this.authManager = authManager;
        this.credentialRepository = credentialRepository;
        this.emailservice=emailservice;
        this.cacherepo=cacherepo;
        this.userrepo = userrepo;
        this.encoder = encoder;
        this.denylistService = denylistService;
        this.jwtUtil = jwtUtil;
    }


    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return credentialRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public ResponseEntity<?> sendEmailCode(String email) {
        if (email == null || !VALID_EMAIL_ADDRESS_REGEX.matcher(email).matches()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new Message("Invalid email format."));
        }
        if (userrepo.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.PERMANENT_REDIRECT).body(new Message("Already exists"));
        }

        String code = generateCode();
        try {
            emailservice.sendVerificationCode(email, code);
            cacherepo.addCode(email, code);
            String sanitizedEmail = HtmlUtils.htmlEscape(email);
            return ResponseEntity.status(HttpStatus.OK).body(new Message(sanitizedEmail));
        } catch (ResendException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Message("Internal Error"));
        }
    }

    private String generateCode() {
        return  UUID.randomUUID()
                .toString()
                .replaceAll("\\D", "")
                .substring(0, 6);
    }

    public ResponseEntity<?> verifyEmailCode(String identifier, String passcode) {
        if (identifier == null || !VALID_EMAIL_ADDRESS_REGEX.matcher(identifier).matches()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new Message("Connection Compermised"));
        }
        String storedCode = cacherepo.getCode(identifier);
        if(storedCode != null && storedCode.equals(passcode)){
            User user= (userrepo.findByEmail(identifier).isPresent())?userrepo.findByEmail(identifier).get(): new User();
            cacherepo.deleteCode(identifier);
            user.setEmail(identifier);
            cacherepo.addUser(identifier, user);
            return ResponseEntity.status(HttpStatus.OK).body(new Message("Verification Successful"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new Message("Verification Failed"));
    }

    @Transactional
    public ResponseEntity<?> setCredentials(CredRequest credentials) {

        if (credentialRepository.findByUsername(credentials.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new Message("UserName already exists"));
        }
        List<String> errors = PasswordValidatorUtility.validatePassword(credentials.getPasscode());
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        try {
            Credential newUser = new Credential();
            User user = cacherepo.getUser(credentials.getEmail());

            user.setUsername(credentials.getUsername());
            userrepo.save(user);

            newUser.setUsername(credentials.getUsername());
            newUser.setPassword(encoder.encode(credentials.getPasscode()));
            newUser.setRoles(List.of("USER"));
            credentialRepository.save(newUser);
            cacherepo.deleteCode(credentials.getEmail());

            return ResponseEntity.ok(new Message("User registered successfully"));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new Message("Error Occur"));
        }

    }


    public ResponseEntity<?> login(AuthRequest request) {
        try {
            var authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPasscode())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtUtil.generateToken(request.getIdentifier());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (AuthenticationException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new Message("Authentication failed: Invalid username or password."));
        }
    }


    public ResponseEntity<?> logout(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");

        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                String jti = jwtUtil.extractJti(jwt);
                denylistService.denylistToken(jti);
            } catch (Exception e) {
            }
        }

        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new Message("Logout successful."));
    }

    @Transactional
    public List<String> changePassword(PasswordChangeRequest request, String username) {
        Credential user = credentialRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        List<String> errors = PasswordValidatorUtility.validatePassword(request.getNewPassword());
        if (!errors.isEmpty()) {
            return errors;
        }
        user.setPassword(encoder.encode(request.getNewPassword()));
        credentialRepository.save(user);
        return  new ArrayList<>();
    }

    public ResponseEntity<?> forgetPassword(String email) {
        if (userrepo.findByEmail(email).isPresent()) {
            String code = generateCode();
            try {
                emailservice.sendVerificationCode(email, code);
                cacherepo.addCode(email, code);
                String sanitizedEmail = HtmlUtils.htmlEscape(email);
                return ResponseEntity.status(HttpStatus.OK).body(new Message(sanitizedEmail));
            } catch (ResendException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Message("Internal Error"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new Message("Email Not Found"));
    }

    @Transactional
    public ResponseEntity<?> resetPassword(String email,String code, String newPassword) {
        String storedCode = cacherepo.getCode(email);
        if(storedCode != null && storedCode.equals(code)){

            Credential user= (userrepo.findByEmail(email).isPresent())?
                    credentialRepository.findByUsername(userrepo.findByEmail(email).get().getUsername()).get()
                    : null;
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new Message("Account not found"));
            }

            List<String> errors = PasswordValidatorUtility.validatePassword(newPassword);
            if (!errors.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
            }
            user.setPassword(encoder.encode(newPassword));
            credentialRepository.save(user);
            cacherepo.deleteCode(email);
            return ResponseEntity.status(HttpStatus.OK).body(new Message("Verification Successful"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new Message("Verification Failed"));
    }
}
