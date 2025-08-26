package com.proj.srldashboard.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.proj.srldashboard.Model.Message;
import com.proj.srldashboard.Model.SrlModel;
import com.proj.srldashboard.Model.User;
import com.proj.srldashboard.Repository.SrlRepository;
import com.proj.srldashboard.Repository.UserRepository;
import com.proj.srldashboard.Utility.CryptographyUtility;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

@Service
public class GenerateService {

    @Value("${app.base-url}")
    private String baseUrl;
    private final CryptographyUtility cryptographyutility;
    private final UserRepository userrepository;
    private final SrlRepository srlrepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public GenerateService(CryptographyUtility cryptographyutility,
                           UserRepository userrepository,
                           SrlRepository srlrepository, ObjectMapper objectMapper) {
        this.cryptographyutility = cryptographyutility;
        this.userrepository = userrepository;
        this.srlrepository = srlrepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ResponseEntity<?> generateSrl(String url, String username){
        try {
            Optional<User> optionalUser = userrepository.findByUsername(username);
            if (optionalUser.isEmpty() || url.isBlank()) {
                return ResponseEntity.badRequest().body(new Message("Generation Failed"));
            }
            User us = optionalUser.get();

            String locator=cryptographyutility
                    .generateShortCode(url, us.getKey());

            SrlModel srl= new SrlModel(url,locator,new Date());
            Optional<SrlModel> optionalSrl =Optional.ofNullable(srlrepository.saveSrl(srl,us.getUserTag()));
            if(optionalSrl.isEmpty())
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new Message("SRL Generation Failed. The user may not have submitted their details."));
            us.setLocator_count(us.getLocator_count()+1);
            userrepository.save(us);
            Map<String, Object> urlMap = objectMapper.convertValue(srl, Map.class);
            urlMap.put("baseUrl", baseUrl);
            return new ResponseEntity<>(urlMap, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Message("An unexpected error occurred while generating the URL."));
        }
    }

    @Transactional
    public ResponseEntity<?> deleteSrl(String userTag, String locator) {
        srlrepository.deleteSrl(userTag, locator);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(new Message("SRL Deleted"));
    }
}
