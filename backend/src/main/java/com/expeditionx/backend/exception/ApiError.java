package com.expeditionx.backend.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
    int status,
    String message,
    String path,
    LocalDateTime timestamp,
    Map<String, String> errors
) {
    public ApiError(int status, String message, String path) {
        this(status, message, path, LocalDateTime.now(), null);
    }

    public ApiError(int status, String message, String path, Map<String, String> errors) {
        this(status, message, path, LocalDateTime.now(), errors);
    }
}
