package com.panther.smartBI.model.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户(User)表实体类
 *
 * @author makejava
 * @since 2023-07-29 21:30:21
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("user")
public class User extends Model<User> {
    //id
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    //账号
    @TableField("userAccount")
    private String userAccount;
    //密码
    @TableField("userPassword")
    private String userPassword;
    //用户昵称
    @TableField("userName")
    private String userName;
    //用户头像
    @TableField("userAvatar")
    private String userAvatar;
    //用户角色：user/admin
    @TableField("userRole")
    private String userRole;
    /**
     * 电话
     */
    @TableField("phoneNum")
    private String phoneNum;

    /**
     * 邮箱
     */
    @TableField("email")
    private String email;

    /**
     * 积分
     */
    @TableField("leftCount")
    private Integer leftCount;
    
    /**
     * 是否VIP
     */
    @TableField("isVip")
    private Integer isVip;

    //创建时间
    @TableField("createTime")
    private Date createTime;
    //更新时间
    @TableField("updateTime")
    private Date updateTime;
    //是否删除
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}

