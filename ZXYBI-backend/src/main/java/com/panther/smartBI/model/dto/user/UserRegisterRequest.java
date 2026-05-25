package com.panther.smartBI.model.dto.user;

import java.io.Serializable;
import lombok.Data;

/**
 * 用户注册请求体
 *
 */
@Data
public class UserRegisterRequest implements Serializable {

    private static final long serialVersionUID = 3191241716373120793L;

    private String userAccount;

    private String userPassword;

    private String checkPassword;
<<<<<<< HEAD

    private String userName;

    private String userAvatar;
=======
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
}
