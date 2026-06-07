package com.panther.smartBI.model.dto.file;

import com.panther.smartBI.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 文件查询请求
 *
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class FileInfoQueryRequest extends PageRequest implements Serializable {

    private Long id;

    private String fileName;

    private String fileFormat;

    private Long userId;

    private Long categoryId;

    private static final long serialVersionUID = 1L;
}
