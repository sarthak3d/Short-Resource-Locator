package com.proj.srlanalytics.Service;

import com.proj.srlanalytics.Config.RabbitMQConfig;
import com.proj.srlanalytics.DTO.ClickEventMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class ClickEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ClickEventConsumer.class);

    private final ClickIngestionService ingestionService;

    public ClickEventConsumer(ClickIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void consume(ClickEventMessage message) {
        try {
            ingestionService.ingest(message);
        } catch (Exception e) {
            // Log and re-throw so Spring AMQP nacks the message for retry/DLQ
            log.error("Failed to ingest click event for {}/{}: {}",
                    message.getUserTag(), message.getLocator(), e.getMessage());
            throw e;
        }
    }
}
