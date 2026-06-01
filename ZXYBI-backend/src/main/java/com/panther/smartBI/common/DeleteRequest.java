package com.panther.smartBI.common;

import java.io.Serializable;
import lombok.Data;

/**
 * 删除请求
 *
 */
@Data
public class DeleteRequest implements Serializable {

    /**
     * id
     */
    private Long id;

    /**
     * 会话ID (用于AI会话删除)
     */
    private String sessionId;

    private static final long serialVersionUID = 1L;
}
