package com.example.bookreviews.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Запрос на создание/обновление комментария")
public record CommentRequest(

        @NotBlank(message = "Текст комментария не может быть пустым")
        @Schema(description = "Текст комментария",
                example = "Отличная книга!")
        String text,

        @NotNull(message = "Оценка обязательна")
        @Min(value = 1, message = "Оценка должна быть от 1 до 10")
        @Max(value = 10, message = "Оценка должна быть от 1 до 10")
        @Schema(description = "Оценка от 1 до 10", example = "8")
        Integer rating,

        @NotNull(message = "ID книги обязательно")
        @Schema(description = "ID книги", example = "1")
        Long bookId,

        @NotNull(message = "ID пользователя обязательно")
        @Schema(description = "ID пользователя", example = "1")
        Long userId
) {
}