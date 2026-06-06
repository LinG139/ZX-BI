package com.panther.smartBI.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.panther.smartBI.model.entity.AiConfig;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AiConfigMapper extends BaseMapper<AiConfig> {

    /**
     * 查询所有启用的配置
     */
    List<AiConfig> selectActiveConfig();

    /**
     * 根据平台类型查询配置
     */
    AiConfig selectByPlatformType(String platformType);
}