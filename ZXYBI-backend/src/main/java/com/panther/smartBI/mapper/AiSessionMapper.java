package com.panther.smartBI.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.panther.smartBI.model.entity.AiSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface AiSessionMapper extends BaseMapper<AiSession> {

    List<AiSession> selectByUserId(Long userId);

    /**
     * 删除指定时间之前的会话记录
     *
     * @param expireTime 过期时间
     * @return 删除的记录数
     */
    int deleteExpiredSessions(@Param("expireTime") LocalDateTime expireTime);
}