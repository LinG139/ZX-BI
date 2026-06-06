package com.panther.smartBI.manager;

import com.panther.smartBI.ai.ZhiPuClient;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.exception.BusinessException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * AI 管理器测试类
 */
public class AiManagerTest {

    @Mock
    private ZhiPuClient zhiPuClient;

    private AiManager aiManager;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        aiManager = new AiManager();
        
        ReflectionTestUtils.setField(aiManager, "zhiPuClient", zhiPuClient);
    }

    @Test
    void testDoChat() {
        String expectedResult = "AI 响应内容";
        when(zhiPuClient.doChat(anyString(), anyBoolean(), any())).thenReturn(expectedResult);

        String result = aiManager.doChat(1L, "测试消息");

        Assertions.assertEquals(expectedResult, result);
        verify(zhiPuClient).doChat(anyString(), eq(false), any());
    }

    @Test
    void testDoChartAnalysis() {
        String expectedResult = "{\"chart\":{}}";
        when(zhiPuClient.doChat(anyString(), anyBoolean(), any())).thenReturn(expectedResult);

        String result = aiManager.doChartAnalysis(1L, "分析数据");

        Assertions.assertEquals(expectedResult, result);
        verify(zhiPuClient).doChat(anyString(), eq(true), any());
    }

    @Test
    void testDoChatByClient() {
        String expectedResult = "客户端响应";
        when(zhiPuClient.doChat(anyString(), anyBoolean(), any())).thenReturn(expectedResult);

        String result = aiManager.doChatByClient(1L, "测试消息");

        Assertions.assertEquals(expectedResult, result);
    }

    @Test
    void testDoChatWithHistory() {
        List<ZhiPuClient.Message> history = Arrays.asList(
            new ZhiPuClient.Message("user", "你好"),
            new ZhiPuClient.Message("assistant", "你好！")
        );
        
        String expectedResult = "带历史的响应";
        when(zhiPuClient.doChatWithHistory(anyString(), anyBoolean(), any(), any())).thenReturn(expectedResult);

        String result = aiManager.doChatWithHistory(1L, "继续对话", null, history);

        Assertions.assertEquals(expectedResult, result);
        verify(zhiPuClient).doChatWithHistory(anyString(), eq(false), any(), any());
    }

    @Test
    void testDoChat_Exception() {
        when(zhiPuClient.doChat(anyString(), anyBoolean(), any())).thenThrow(new RuntimeException("网络异常"));

        Assertions.assertThrows(BusinessException.class, () -> {
            aiManager.doChat(1L, "测试消息");
        });
    }

    @Test
    void testDoChartAnalysis_WithPrompt() {
        String expectedResult = "带提示词的响应";
        String prompt = "你是一个数据分析专家";
        
        when(zhiPuClient.doChat(anyString(), anyBoolean(), eq(prompt))).thenReturn(expectedResult);

        String result = aiManager.doChartAnalysis(1L, "分析数据", prompt);

        Assertions.assertEquals(expectedResult, result);
    }
}
