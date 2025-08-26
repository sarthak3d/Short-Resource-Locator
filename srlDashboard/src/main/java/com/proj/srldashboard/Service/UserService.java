package com.proj.srldashboard.Service;

import com.proj.srldashboard.Model.Message;
import com.proj.srldashboard.Model.User;
import com.proj.srldashboard.Model.UserDTO;
import com.proj.srldashboard.Model.UserDetailsDTO;
import com.proj.srldashboard.Repository.SrlRepository;
import com.proj.srldashboard.Repository.UserRepository;
import com.proj.srldashboard.Utility.CryptographyUtility;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserService {

    @Value("${app.base-url}")
    private String baseUrl;
    private final UserRepository repo;
    private final CryptographyUtility cryptographyutility;
    private final SrlRepository srlrepository;

    public UserService(UserRepository repo,
            CryptographyUtility cryptographyutility,
            SrlRepository srlrepository) {
        this.repo = repo;
        this.cryptographyutility = cryptographyutility;
        this.srlrepository = srlrepository;
    }

    @Transactional
    public ResponseEntity<?> submitDetails(UserDTO request, String username) {
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid authentication principal.");
        }
        if (repo.findByUserTag(request.getUserTag()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User tag already exists.");
        }
        if (request.getUserTag().length() != 4) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user tag.");
        }
        User form = repo.findByUsername(username).get();
        try {
            form.setName(request.getName());
            form.setUserTag(request.getUserTag());
            form.setKey(cryptographyutility.generateAESKey());
            form.setLocator_count(0);
            form.setSubmitted(true);
            repo.save(form);
            return ResponseEntity.ok(new Message("User details submitted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new Message("Failed to generate user key."));
        }
    }

    public ResponseEntity<?> getDetails(String username) {
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid authentication principal.");
        }
        UserDetailsDTO userdetailsDTO = new UserDetailsDTO();
        Optional<User> optionalUser = repo.findByUsername(username);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Unable to fetch user details.");
        }
        userdetailsDTO.setUsername(username);
        userdetailsDTO.setEmail(optionalUser.get().getEmail());
        userdetailsDTO.setName(optionalUser.get().getName());
        userdetailsDTO.setUserTag(optionalUser.get().getUserTag());
        userdetailsDTO.setLocator_count(optionalUser.get().getLocator_count());

        return ResponseEntity.status(HttpStatus.OK).body(userdetailsDTO);
    }

    @Transactional
    public ResponseEntity<?> updateDetails(UserDTO request, String username) {
        Optional<User> optionaluser = repo.findByUsername(username);
        if (optionaluser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED)
                    .body("Unable to update user details.");
        }
        User user = optionaluser.get();

        if (!user.getName().equals(request.getName())) {
            user.setName(request.getName());
        }
        repo.save(user);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(new Message("User details updated successfully."));
    }

    public ResponseEntity<?> getSrlList(String username) {
        Optional<User> optionalUser = repo.findByUsername(username);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Unable to fetch data");
        }
        String usertag = optionalUser.get().getUserTag();
        List<Map> srllist = srlrepository.listSrl(usertag).stream()
                .peek(srl -> srl.put("baseUrl", baseUrl))
                .toList();
        return new ResponseEntity<>(srllist, HttpStatus.OK);
    }
}
