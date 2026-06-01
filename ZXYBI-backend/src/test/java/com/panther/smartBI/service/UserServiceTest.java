package com.panther.smartBI.service;

import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.model.entity.User;
import com.panther.smartBI.model.enums.UserRoleEnum;
import com.panther.smartBI.model.vo.LoginUserVO;
import com.panther.smartBI.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 用户服务测试类
 */
public class UserServiceTest {

    @Mock
    private com.panther.smartBI.mapper.UserMapper userMapper;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpSession session;

    private UserServiceImpl userService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        userService = new UserServiceImpl();
        // 使用反射设置mapper
        try {
            java.lang.reflect.Field mapperField = UserServiceImpl.class.getSuperclass().getDeclaredField("baseMapper");
            mapperField.setAccessible(true);
            mapperField.set(userService, userMapper);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    void testUserRegister_NormalCase() {
        String userAccount = "testUser";
        String userPassword = "password123";
        String checkPassword = "password123";

        when(userMapper.selectCount(any())).thenReturn(0L);
        when(userMapper.insert(any())).thenReturn(1);

        long result = userService.userRegister(userAccount, userPassword, checkPassword);
        Assertions.assertNotEquals(-1, result);
    }

    @Test
    void testUserRegister_NullParams() {
        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister(null, "password123", "password123");
        });

        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister("test", null, "password123");
        });

        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister("test", "password123", null);
        });
    }

    @Test
    void testUserRegister_ShortAccount() {
        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister("abc", "password123", "password123");
        });
    }

    @Test
    void testUserRegister_ShortPassword() {
        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister("testUser", "pass", "pass");
        });
    }

    @Test
    void testUserRegister_PasswordMismatch() {
        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister("testUser", "password123", "password456");
        });
    }

    @Test
    void testUserRegister_DuplicateAccount() {
        String userAccount = "testUser";
        String userPassword = "password123";
        String checkPassword = "password123";

        when(userMapper.selectCount(any())).thenReturn(1L);

        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister(userAccount, userPassword, checkPassword);
        });
    }

    @Test
    void testUserLogin_Success() {
        String userAccount = "testUser";
        String userPassword = "password123";
        
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUserAccount(userAccount);
        mockUser.setUserPassword(org.springframework.util.DigestUtils.md5DigestAsHex(("panther" + userPassword).getBytes()));
        mockUser.setUserName("Test User");
        mockUser.setUserRole(UserRoleEnum.USER.getValue());

        when(userMapper.selectOne(any())).thenReturn(mockUser);
        when(request.getSession()).thenReturn(session);

        LoginUserVO result = userService.userLogin(userAccount, userPassword, request);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(1L, result.getId());
        Assertions.assertEquals(userAccount, result.getUserAccount());
        verify(session).setAttribute(any(), any());
    }

    @Test
    void testUserLogin_NullParams() {
        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userLogin(null, "password123", request);
        });

        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userLogin("testUser", null, request);
        });
    }

    @Test
    void testUserLogin_WrongPassword() {
        String userAccount = "testUser";
        String userPassword = "wrongPassword";

        when(userMapper.selectOne(any())).thenReturn(null);

        Assertions.assertThrows(BusinessException.class, () -> {
            userService.userLogin(userAccount, userPassword, request);
        });
    }

    @Test
    void testIsAdmin_AdminUser() {
        User adminUser = new User();
        adminUser.setUserRole(UserRoleEnum.ADMIN.getValue());

        boolean result = userService.isAdmin(adminUser);
        Assertions.assertTrue(result);
    }

    @Test
    void testIsAdmin_NormalUser() {
        User normalUser = new User();
        normalUser.setUserRole(UserRoleEnum.USER.getValue());

        boolean result = userService.isAdmin(normalUser);
        Assertions.assertFalse(result);
    }

    @Test
    void testIsAdmin_NullUser() {
        User nullUser = null;
        boolean result = userService.isAdmin(nullUser);
        Assertions.assertFalse(result);
    }

    @Test
    void testRechargeUserCount_Success() {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setLeftCount(100);

        when(userMapper.selectById(any())).thenReturn(mockUser);
        when(userMapper.updateById(any())).thenReturn(1);
        when(request.getSession()).thenReturn(session);

        int result = userService.rechargeUserCount(request, 50);

        Assertions.assertEquals(150, result);
        verify(session).setAttribute(any(), any());
    }

    @Test
    void testUpdateUserChartCount_Success() {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setLeftCount(100);

        when(userMapper.selectById(any())).thenReturn(mockUser);
        when(userMapper.updateById(any())).thenReturn(1);

        boolean result = userService.updateUserChartCount(1L);

        Assertions.assertTrue(result);
        Assertions.assertEquals(95, mockUser.getLeftCount());
    }

    @Test
    void testUpdateUserChartCount_InsufficientCount() {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setLeftCount(0);

        when(userMapper.selectById(any())).thenReturn(mockUser);

        Assertions.assertThrows(BusinessException.class, () -> {
            userService.updateUserChartCount(1L);
        });
    }

    @Test
    void testUpdateUserChartCount_NullLeftCount() {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setLeftCount(null);

        when(userMapper.selectById(any())).thenReturn(mockUser);

        Assertions.assertThrows(BusinessException.class, () -> {
            userService.updateUserChartCount(1L);
        });
    }

    @Test
    void testUpdateUserChartCount_ExceedMaxCalls() throws InterruptedException {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setLeftCount(100);
        mockUser.setUserRole(UserRoleEnum.USER.getValue());

        when(userMapper.selectById(any())).thenReturn(mockUser);
        when(userMapper.updateById(any())).thenReturn(1);

        for (int i = 0; i < 10; i++) {
            Assertions.assertTrue(userService.updateUserChartCount(1L));
        }

        Assertions.assertThrows(BusinessException.class, () -> {
            userService.updateUserChartCount(1L);
        });

        Assertions.assertEquals(UserRoleEnum.BAN.getValue(), mockUser.getUserRole());
    }
}