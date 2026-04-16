package com.example.bookreviews.dto;

import com.example.bookreviews.model.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Запрос на создание/обновление пользователя")
public record UserRequest(

        @NotBlank(message = "Имя пользователя не может быть пустым")
        @Schema(description = "Имя пользователя", example = "Иван")
        String name,

        @Schema(description = "Роль пользователя", example = "USER")
        Role role
) {
}