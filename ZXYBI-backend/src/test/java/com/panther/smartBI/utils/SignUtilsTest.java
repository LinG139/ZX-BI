package com.panther.smartBI.utils;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * 签名工具测试类
 */
public class SignUtilsTest {

    @Test
    void testGenSign_NormalCase() {
        String body = "testBody";
        String secretKey = "testSecret";

        String result = SignUtils.genSign(body, secretKey);

        Assertions.assertNotNull(result);
        Assertions.assertFalse(result.isEmpty());
    }

    @Test
    void testGenSign_NullBody() {
        String body = null;
        String secretKey = "testSecret";

        String result = SignUtils.genSign(body, secretKey);

        Assertions.assertNotNull(result);
    }

    @Test
    void testGenSign_NullSecretKey() {
        String body = "testBody";
        String secretKey = null;

        String result = SignUtils.genSign(body, secretKey);

        Assertions.assertNotNull(result);
    }

    @Test
    void testGenSign_EmptyParams() {
        String body = "";
        String secretKey = "";

        String result = SignUtils.genSign(body, secretKey);

        Assertions.assertNotNull(result);
    }

    @Test
    void testGenSign_SameInputSameOutput() {
        String body = "testBody";
        String secretKey = "testSecret";

        String result1 = SignUtils.genSign(body, secretKey);
        String result2 = SignUtils.genSign(body, secretKey);

        Assertions.assertEquals(result1, result2);
    }

    @Test
    void testGenSign_DifferentBodyDifferentOutput() {
        String secretKey = "testSecret";

        String result1 = SignUtils.genSign("body1", secretKey);
        String result2 = SignUtils.genSign("body2", secretKey);

        Assertions.assertNotEquals(result1, result2);
    }

    @Test
    void testGenSign_DifferentSecretKeyDifferentOutput() {
        String body = "testBody";

        String result1 = SignUtils.genSign(body, "secret1");
        String result2 = SignUtils.genSign(body, "secret2");

        Assertions.assertNotEquals(result1, result2);
    }
}
