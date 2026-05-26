package com.panther.smartBI.model.dto.ai;

import lombok.Data;

/**
 * @author Gin 琴酒
 * @data 2023/8/7 14:53
 */
@Data
public class ChatRequest {

    private String message;

    private String role;

    private String prompt;

    private Long userId;

    private Long sessionId;

    private String userAvatar;

    private String userName;

    private String aiName;

    private String aiAvatar;
}
