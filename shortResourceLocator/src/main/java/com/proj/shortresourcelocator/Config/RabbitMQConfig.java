package com.proj.shortresourcelocator.Config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE    = "srl.analytics";
    public static final String QUEUE       = "srl.click.events";
    public static final String ROUTING_KEY = "analytics.click";

    @Bean
    public TopicExchange analyticsExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue clickEventsQueue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public Binding clickEventsBinding(Queue clickEventsQueue, TopicExchange analyticsExchange) {
        return BindingBuilder.bind(clickEventsQueue).to(analyticsExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
