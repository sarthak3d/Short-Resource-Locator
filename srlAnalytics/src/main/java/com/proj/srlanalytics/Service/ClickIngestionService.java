package com.proj.srlanalytics.Service;

import com.proj.srlanalytics.DTO.ClickEventMessage;
import com.proj.srlanalytics.Model.ClickEvent;
import com.proj.srlanalytics.Model.UniqueVisitor;
import com.proj.srlanalytics.Repository.ClickEventRepository;
import com.proj.srlanalytics.Repository.UniqueVisitorRepository;
import com.proj.srlanalytics.Utility.UserAgentParser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;

@Service
public class ClickIngestionService {

    private final ClickEventRepository clickEventRepository;
    private final UniqueVisitorRepository uniqueVisitorRepository;
    private final UserAgentParser userAgentParser;

    public ClickIngestionService(ClickEventRepository clickEventRepository,
                                 UniqueVisitorRepository uniqueVisitorRepository,
                                 UserAgentParser userAgentParser) {
        this.clickEventRepository = clickEventRepository;
        this.uniqueVisitorRepository = uniqueVisitorRepository;
        this.userAgentParser = userAgentParser;
    }

    @Transactional
    public void ingest(ClickEventMessage message) {
        String ipHash = sha256Hex(message.getIpAddress());
        
        // Parse User-Agent BEFORE interacting with the DB to avoid holding locks during CPU processing.
        String os = userAgentParser.extractOs(message.getUserAgent());
        String browser = userAgentParser.extractBrowser(message.getUserAgent());

        // Atomically attempt to insert the unique visitor.
        // Returns 1 if successful (unique), 0 if conflict (duplicate).
        int rowsInserted = uniqueVisitorRepository.insertIgnoreConflict(
                message.getUserTag(),
                message.getLocator(),
                ipHash,
                OffsetDateTime.now()
        );
        boolean isUnique = (rowsInserted == 1);

        ClickEvent event = new ClickEvent();
        event.setUserTag(message.getUserTag());
        event.setLocator(message.getLocator());
        event.setClickedAt(OffsetDateTime.now());
        event.setIpHash(ipHash);
        event.setCountry(message.getCountry() != null ? message.getCountry() : "");
        event.setOs(os);
        event.setBrowser(browser);
        event.setReferrer(message.getReferrer() != null ? message.getReferrer() : "");
        event.setUnique(isUnique);

        clickEventRepository.save(event);
    }

    private String sha256Hex(String input) {
        if (input == null || input.isBlank()) return "";
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return "";
        }
    }
}
