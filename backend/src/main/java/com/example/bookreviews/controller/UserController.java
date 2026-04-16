package com.example.bookreviews.controller;

import com.example.bookreviews.dto.UserDto;
import com.example.bookreviews.dto.UserRequest;
import com.example.bookreviews.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "Пользователи",
        description = "CRUD-операции с пользователями")
public  class UserController {

    private final UserService userService;

    public UserController(final UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Получить всех пользователей")
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить пользователя по ID")
    public UserDto getUserById(@PathVariable final Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    @Operation(summary = "Создать пользователя")
    public UserDto createUser(
            @Valid @RequestBody final UserRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить пользователя")
    public UserDto updateUser(
            @PathVariable final Long id,
            @Valid @RequestBody final UserRequest request) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить пользователя")
    public String deleteUser(@PathVariable final Long id) {
        userService.deleteUser(id);
        return "Пользователь удален!";
    }
}