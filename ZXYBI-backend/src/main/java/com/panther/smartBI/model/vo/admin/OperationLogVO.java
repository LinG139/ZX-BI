package com.panther.smartBI.model.vo.admin;

import lombok.Data;

import java.io.Serializable;

@Data
public class OperationLogVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long userId;

    private String userName;

    private String operation;

    private String module;

    private String method;

    private String ip;

    private String location;

    private Integer status;

    private String errorMessage;

    private String params;

    private String result;

    private Long duration;

    private String createTime;
}
