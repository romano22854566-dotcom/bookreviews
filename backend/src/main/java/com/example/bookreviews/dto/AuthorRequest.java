package com.example.bookreviews.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Запрос на создание/обновление автора")
public record AuthorRequest(

        @NotBlank(message = "Имя автора не может быть пустым")
        @Size(max = 50, message = "Имя не может превышать 50 символов")
        @Pattern(regexp = "^[a-zA-Zа-яА-ЯёЁ\\s\\-]+$",
                message = "Имя может содержать только буквы, пробелы и дефисы (без цифр)")

        @Schema(description = "Имя автора", example = "Лев")
        String firstName,

        @NotBlank(message = "Фамилия автора не может быть пустой")
        @Size(max = 50, message = "Фамилия не может превышать 50 символов")

        @Pattern(regexp = "^[a-zA-Zа-яА-ЯёЁ\\s\\-]+$",
                message = "Фамилия может содержать только буквы, пробелы и дефисы (без цифр)")
        @Schema(description = "Фамилия автора", example = "Толстой")
        String lastName
) {
}