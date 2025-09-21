package com.proj.srlanalytics.Utility;

import org.springframework.stereotype.Component;
import ua_parser.Client;
import ua_parser.Parser;

@Component
public class UserAgentParser {

    private final Parser parser;

    public UserAgentParser() {
        try {
            this.parser = new Parser();
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize UA parser", e);
        }
    }

    public String extractOs(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return "";
        Client client = parser.parse(userAgent);
        if (client.os != null && client.os.family != null) {
            String os = client.os.family;
            return "Other".equals(os) ? "Unknown" : os;
        }
        return "Unknown";
    }

    public String extractBrowser(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return "";
        Client client = parser.parse(userAgent);
        if (client.userAgent != null && client.userAgent.family != null) {
            String browser = client.userAgent.family;
            return "Other".equals(browser) ? "Unknown" : browser;
        }
        return "Unknown";
    }
}
