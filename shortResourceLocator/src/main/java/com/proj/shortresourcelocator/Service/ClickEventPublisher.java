package com.proj.shortresourcelocator.Service;

import com.proj.shortresourcelocator.Config.RabbitMQConfig;
import com.proj.shortresourcelocator.DTO.ClickEventMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class ClickEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ClickEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public ClickEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(HttpServletRequest request, String userTag, String locator) {
        try {
            ClickEventMessage message = new ClickEventMessage(
                    userTag,
                    locator,
                    resolveIp(request),
                    request.getHeader("User-Agent"),
                    request.getHeader("Referer"),
                    resolveCountry(request));

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY,
                    message);
        } catch (Exception e) {
            // Fire-and-forget: analytics failures must never affect redirects
            log.warn("Failed to publish click event for {}/{}: {}", userTag, locator, e.getMessage());
        }
    }

    private String resolveIp(HttpServletRequest request) {
        // Prefer Cloudflare's real-IP header, fall back to X-Forwarded-For, then socket address
        String cfIp = request.getHeader("CF-Connecting-IP");
        if (cfIp != null && !cfIp.isBlank()) return cfIp;

        String xForwarded = request.getHeader("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isBlank()) {
            return xForwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String resolveCountry(HttpServletRequest request) {
        String cfCountry = request.getHeader("CF-IPCountry");
        if (cfCountry != null && !cfCountry.isBlank()) return cfCountry;
        String xCountry = request.getHeader("X-Country");
        return (xCountry != null && !xCountry.isBlank()) ? xCountry : "";
    }
}
