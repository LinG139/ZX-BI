package com.panther.smartBI.bizMQ;

import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.constant.BiConstant;
import com.panther.smartBI.constant.BiMQConstant;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.manager.AiManager;
import com.panther.smartBI.model.entity.Chart;
import com.panther.smartBI.model.enums.ChartStatusEnum;
import com.panther.smartBI.service.ChartService;
import com.panther.smartBI.utils.UserInputUtils;
import com.rabbitmq.client.Channel;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**
 * 消费者
 *
 * @author Gin 琴酒
 * @data 2023/8/5 23:39
 */
@Slf4j
@Component
public class ReceiveMessage {

    @Resource
    private ChartService chartService;

    @Resource
    private AiManager aiManager;

    /**
     * RabbitListener 这个注解会自动填充下面参数
     * @param message 消息
     * @param channel 信道
     * @param deliveryTag 确认消息的标签
     */
    @SneakyThrows // lombok 提供的消除异常注解。原理：利用泛型将我们传入的Throwable强转为RuntimeException
    @RabbitListener(queues = {BiMQConstant.BI_QUEUE_NAME}, ackMode = "MANUAL") // ackMode人工确认机制，
    public void receiveMessage(String message, Channel channel, @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) {
        // 消息为空
        if(StringUtils.isBlank(message)){
            // 消息的标识 取消批量确认 不放回队列
            channel.basicNack(deliveryTag,false,false);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR,"消息为空！");
        }
        // 解析消息队列中的消息（存char的id）
        long chartId = Long.parseLong(message);

        // 根据chart 构建用户输入
        String userInput = UserInputUtils.BuilderUserInput(chartId,chartService);

        // 查询当前图表状态，确保只有等待中(0)或失败(-1)的图表才能被处理
        Chart chart = chartService.getById(chartId);
        if (chart == null) {
            log.warn("图表不存在，chartId: {}", chartId);
            channel.basicAck(deliveryTag, false);
            return;
        }
        
        // 如果图表已经成功或正在处理中，跳过重复处理
        Integer currentStatus = chart.getStatus();
        if (currentStatus == ChartStatusEnum.CHART_STATUS_SUCCESS.getValue()) {
            log.warn("图表已成功，无需重复处理，chartId: {}", chartId);
            channel.basicAck(deliveryTag, false);
            return;
        }
        
        Chart update = new Chart();
        update.setId(chartId);
        // 更新状态为执行中
        update.setStatus(ChartStatusEnum.CHART_STATUS_RUNNING.getValue());
        update.setExecMessage(ChartStatusEnum.CHART_STATUS_RUNNING.getText());
        if (!chartService.updateById(update)) {
            // 如果执行失败 更新状态
            update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
            update.setExecMessage(ChartStatusEnum.CHART_STATUS_FAILURE.getText());
            chartService.updateById(update);
            channel.basicNack(deliveryTag,false,false);
            throw new BusinessException(ErrorCode.OPERATION_ERROR,"图标生成失败！");
        }
        
        String genChart;
        String genResult;
        
        try {
            String aiRes = aiManager.doChartAnalysis(BiConstant.BI_MODEL_ID_S, userInput);
            
            String normalizedResponse = normalizeAiResponse(aiRes);
            String[] aiData = normalizedResponse.split("=>=>=>");

            if (aiData.length == 1) {
                String content = aiData[0].trim();
                if (isValidJson(content)) {
                    genChart = content;
                    genResult = "AI分析完成";
                } else {
                    genResult = content;
                    genChart = "{}";
                }
            } else if (aiData.length == 2) {
                String analysisConclusion = aiData[0].trim();
                if (isValidJson(aiData[1].trim())) {
                    genChart = aiData[1].trim();
                    genResult = analysisConclusion;
                } else {
                    genResult = aiData[1].trim();
                    genChart = "{}";
                }
            } else if (aiData.length >= 3) {
                genChart = aiData[1].trim();
                genResult = aiData[2].trim();
                
                for (int i = 3; i < aiData.length; i++) {
                    genResult += " =>=>=> " + aiData[i].trim();
                }
            } else {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 返回数据格式异常");
            }

            if (StringUtils.isBlank(genChart)) {
                genChart = "{}";
            }
            
            if (StringUtils.isBlank(genResult)) {
                genResult = "AI分析完成";
            }

            if (!isValidJson(genChart)) {
                log.warn("AI返回的图表JSON格式无效，使用空对象");
                genChart = "{}";
            }

            // 更新状态为成功
            update.setStatus(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue());
            update.setExecMessage(ChartStatusEnum.CHART_STATUS_SUCCESS.getText());
            update.setGenChart(genChart);
            update.setGenResult(genResult);
            chartService.updateById(update);
            channel.basicAck(deliveryTag,false);
        } catch (BusinessException e) {
            log.error("图表生成业务异常，chartId: {}, error: {}", chartId, e.getMessage());
            update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
            update.setExecMessage(e.getMessage());
            chartService.updateById(update);
            channel.basicNack(deliveryTag,false,false);
        } catch (Exception e) {
            log.error("图表生成系统异常，chartId: {}", chartId, e);
            update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
            update.setExecMessage("图表生成失败: " + e.getMessage());
            chartService.updateById(update);
            channel.basicNack(deliveryTag,false,false);
        }
    }

    private String normalizeAiResponse(String response) {
        String normalized = response.trim();
        
        if (normalized.startsWith("```json")) {
            normalized = normalized.substring(7);
        } else if (normalized.startsWith("```")) {
            normalized = normalized.substring(3);
        }
        
        if (normalized.endsWith("```")) {
            normalized = normalized.substring(0, normalized.length() - 3);
        }
        
        normalized = normalized.replaceAll("\\r\\n", "\n").trim();
        
        return normalized;
    }

    private boolean isValidJson(String json) {
        if (StringUtils.isBlank(json)) {
            return false;
        }
        String trimmed = json.trim();
        return (trimmed.startsWith("{") && trimmed.endsWith("}")) || 
               (trimmed.startsWith("[") && trimmed.endsWith("]"));
    }

}
