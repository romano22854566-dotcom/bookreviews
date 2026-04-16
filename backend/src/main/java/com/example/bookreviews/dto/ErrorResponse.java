package com.example.bookreviews.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Единый формат ошибки")
public record ErrorResponse(

        @Schema(description = "HTTP-статус код", example = "404")
        int status,

        @Schema(description = "Сообщение об ошибке",
                example = "Книга не найдена с id: 99")
        String message,

        @Schema(description = "Время возникновения ошибки")
        LocalDateTime timestamp,

        @Schema(description = "Детали ошибок валидации (поле → сообщение)")
        Map<String, String> errors
) {
}