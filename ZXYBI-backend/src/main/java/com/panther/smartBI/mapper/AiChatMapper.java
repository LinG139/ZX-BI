package com.panther.smartBI.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.panther.smartBI.model.entity.AiChat;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface AiChatMapper extends BaseMapper<AiChat> {

    List<AiChat> selectBySessionId(Long sessionId);

    void deleteBySessionId(Long sessionId);

    /**
     * 删除指定时间之前的聊天记录
     *
     * @param expireTime 过期时间
     * @return 删除的记录数
     */
    int deleteExpiredChats(@Param("expireTime") LocalDateTime expireTime);
}