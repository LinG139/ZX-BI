package com.panther.smartBI.common;

/**
 * 返回工具类
 *
 */
public class ResultUtils {

    /**
     * 成功
     *
     * @param data
     * @param <T>
     * @return
     */
    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(0, data, "ok");
    }

    /**
     * 失败
     *
     * @param errorCode
     * @return
     */
    public static BaseResponse error(ErrorCode errorCode) {
        BaseResponse response = new BaseResponse(errorCode);
        response.setSuccess(false);
        return response;
    }

    /**
     * 失败
     *
     * @param code
     * @param message
     * @return
     */
    public static BaseResponse error(int code, String message) {
        BaseResponse response = new BaseResponse(code, null, message);
        response.setSuccess(false);
        return response;
    }

    /**
     * 失败
     *
     * @param errorCode
     * @return
     */
    public static BaseResponse error(ErrorCode errorCode, String message) {
        BaseResponse response = new BaseResponse(errorCode.getCode(), null, message);
        response.setSuccess(false);
        return response;
    }
}
