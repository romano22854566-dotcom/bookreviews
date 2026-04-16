package com.example.bookreviews.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Запрос на создание/обновление категории")
public record CategoryRequest(

        @NotBlank(message = "Название категории не может быть пустым")
        @Schema(description = "Название категории", example = "Роман")
        String name
) {
}