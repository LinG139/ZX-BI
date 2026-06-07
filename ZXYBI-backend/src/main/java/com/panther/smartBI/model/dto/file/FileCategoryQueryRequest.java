package com.panther.smartBI.model.dto.file;

import com.panther.smartBI.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 文件分类查询请求
 *
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class FileCategoryQueryRequest extends PageRequest implements Serializable {

    private Long id;

    private String categoryName;

    private static final long serialVersionUID = 1L;
}
