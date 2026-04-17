package com.panther.smartBI.model.vo;

import lombok.Data;

@Data
public class ChatResponse {
    private String answer;
    private Long sessionId;
}