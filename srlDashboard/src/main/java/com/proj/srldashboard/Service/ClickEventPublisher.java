package com.proj.srldashboard.Service;

import com.proj.srldashboard.Config.RabbitMQConfig;
import com.proj.srldashboard.DTO.ClickEventMessage;
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

    public void publish(ClickEventMessage message) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY,
                    message);
        } catch (Exception e) {
            log.warn("Failed to publish click event for {}/{}: {}",
                    message.getUserTag(), message.getLocator(), e.getMessage());
        }
    }
}
