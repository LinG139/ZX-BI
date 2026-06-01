package com.panther.smartBI.utils;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * SQL工具测试类
 */
public class SqlUtilsTest {

    @Test
    void testValidSortField_NormalField() {
        Assertions.assertTrue(SqlUtils.validSortField("id"));
        Assertions.assertTrue(SqlUtils.validSortField("createTime"));
        Assertions.assertTrue(SqlUtils.validSortField("userName"));
        Assertions.assertTrue(SqlUtils.validSortField("leftCount"));
    }

    @Test
    void testValidSortField_NullField() {
        Assertions.assertFalse(SqlUtils.validSortField(null));
    }

    @Test
    void testValidSortField_EmptyField() {
        Assertions.assertFalse(SqlUtils.validSortField(""));
        Assertions.assertFalse(SqlUtils.validSortField("   "));
    }

    @Test
    void testValidSortField_ContainsEquals() {
        Assertions.assertFalse(SqlUtils.validSortField("id=1"));
        Assertions.assertFalse(SqlUtils.validSortField("name='test'"));
    }

    @Test
    void testValidSortField_ContainsParentheses() {
        Assertions.assertFalse(SqlUtils.validSortField("id(1)"));
        Assertions.assertFalse(SqlUtils.validSortField("(select"));
        Assertions.assertFalse(SqlUtils.validSortField(")"));
    }

    @Test
    void testValidSortField_ContainsSpace() {
        Assertions.assertFalse(SqlUtils.validSortField("id name"));
        Assertions.assertFalse(SqlUtils.validSortField(" order by"));
    }

    @Test
    void testValidSortField_SQLInjectionAttempts() {
        Assertions.assertFalse(SqlUtils.validSortField("id; DROP TABLE users"));
        Assertions.assertFalse(SqlUtils.validSortField("id OR 1=1"));
        Assertions.assertFalse(SqlUtils.validSortField("(SELECT"));
        Assertions.assertFalse(SqlUtils.validSortField(") UNION"));
    }
}
