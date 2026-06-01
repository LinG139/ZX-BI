package com.panther.smartBI.model.vo.admin;

import lombok.Data;

import java.io.Serializable;

@Data
public class LoginLogVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long userId;

    private String userName;

    private String ip;

    private String location;

    private String device;

    private Integer status;

    private String createTime;
}
