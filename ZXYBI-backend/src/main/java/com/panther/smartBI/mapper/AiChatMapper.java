package com.panther.smartBI.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
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

    /**
     * 分页查询聊天记录（带结果映射）
     *
     * @param page 分页对象
     * @param wrapper 查询条件
     * @return 分页结果
     */
    IPage<AiChat> selectPageWithResultMap(Page<AiChat> page, @Param("ew") com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AiChat> wrapper);
}