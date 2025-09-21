package com.proj.srlanalytics.Config;

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

    public static final String EXCHANGE = "srl.analytics";
    public static final String QUEUE = "srl.click.events";
    public static final String ROUTING_KEY = "analytics.click";

    @Bean
    public TopicExchange analyticsExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue clickEventsQueue() {
        return new Queue(QUEUE, true); // durable = true
    }

    @Bean
    public Binding clickEventsBinding(Queue clickEventsQueue, TopicExchange analyticsExchange) {
        return BindingBuilder.bind(clickEventsQueue).to(analyticsExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper typeMapper = new org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper();
        typeMapper.setTrustedPackages("*");
        // Instruct Jackson to ignore the publisher's __TypeId__ package name,
        // and instead infer the Class from the @RabbitListener method parameter.
        typeMapper.setTypePrecedence(
                org.springframework.amqp.support.converter.Jackson2JavaTypeMapper.TypePrecedence.INFERRED);
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
