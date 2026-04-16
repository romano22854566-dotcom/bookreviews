package com.example.bookreviews.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

@Schema(description = "Запрос на создание/обновление книги")
public record BookRequest(
        @NotBlank(message = "Название книги не может быть пустым")
        @Size(max = 128, message = "Название не может превышать 128 символов")
        @Schema(description = "Название книги", example = "Война и мир")
        String title,

        @Min(value = 1, message = "Количество страниц должно быть больше 0")
        @Schema(description = "Количество страниц", example = "1225")
        int pages,

        @NotNull(message = "Год публикации обязателен")
        @Min(value = 1440, message = "Год издания не может быть меньше 1440 (изобретение печатного станка)")
        @Max(value = 2026, message = "Год издания не может быть больше текущего (2026)")
        @Schema(description = "Год публикации (от 1440 до 2026)", example = "1869")
        Integer publicationYear,

        @Schema(description = "Список ID авторов")
        List<Long> authorIds,

        @Schema(description = "Список ID категорий")
        List<Long> categoryIds
) {
}