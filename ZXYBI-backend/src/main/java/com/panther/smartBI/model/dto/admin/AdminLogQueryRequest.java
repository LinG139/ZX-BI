package com.panther.smartBI.model.dto.admin;

import lombok.Data;

import java.io.Serializable;

@Data
public class AdminLogQueryRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Long userId;

    private String searchText;

    private Integer status;

    private String startTime;

    private String endTime;

    private Long current = 1L;

    private Long pageSize = 10L;

    private String sortField;

    private String sortOrder;
}
