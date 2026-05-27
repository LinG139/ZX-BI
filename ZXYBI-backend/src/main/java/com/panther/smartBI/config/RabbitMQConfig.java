package com.panther.smartBI.config;

import com.panther.smartBI.constant.BiMQConstant;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ 配置类
 * 自动声明队列和交换机，避免启动时队列不存在的问题
 */
@Configuration
public class RabbitMQConfig {

    /**
     * 声明队列
     */
    @Bean
    public Queue codeQueue() {
        // durable: true - 持久化队列
        // exclusive: false - 非独占队列
        // autoDelete: false - 不自动删除
        return new Queue(BiMQConstant.BI_QUEUE_NAME, true, false, false);
    }

    /**
     * 声明交换机
     */
    @Bean
    public DirectExchange codeExchange() {
        return new DirectExchange(BiMQConstant.BI_EXCHANGE_NAME, true, false);
    }

    /**
     * 绑定队列和交换机
     */
    @Bean
    public Binding binding(Queue codeQueue, DirectExchange codeExchange) {
        return BindingBuilder.bind(codeQueue).to(codeExchange).with(BiMQConstant.BI_ROUTING_KEY);
    }
}