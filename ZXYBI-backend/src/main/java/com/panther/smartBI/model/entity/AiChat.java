package com.panther.smartBI.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * AI聊天
 * @TableName aichat
 */
@TableName(value ="ai_chat")
@Data
public class AiChat implements Serializable {
    /**
     * id
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
<<<<<<< HEAD
     * 会话ID
     */
    @TableField(value = "sessionId")
    private Long sessionId;

    /**
=======
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
     * 用户id
     */
    @TableField(value = "userId")
    private Long userId;

    /**
     * 用户头像
     */
    @TableField(value = "userAvatar")
    private String userAvatar;

    /**
     * 用户发送
     */
    @TableField(value = "userMessage")
    private String userMessage;

    /**
     * AI消息
     */
    @TableField(value = "AIMessage")
    private String AIMessage;

    /**
<<<<<<< HEAD
     *
=======
     * 
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
     */
    @TableField(value = "AIAvatar")
    private String AIAvatar;

    /**
     * 创建时间
     */
    @TableField(value = "createTime")
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField(value = "updateTime")
    private Date updateTime;

    private String userName;

    private String AIName;

<<<<<<< HEAD
    /**
     * 是否删除
     */
    @TableField(value = "isDelete")
    private Integer isDelete;

=======
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}