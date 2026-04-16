package com.example.bookreviews.controller;

import com.example.bookreviews.dto.AuthorDto;
import com.example.bookreviews.dto.AuthorRequest;
import com.example.bookreviews.service.AuthorService;
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
@RequestMapping("/authors")
@Tag(name = "Авторы", description = "CRUD-операции с авторами")
public  class AuthorController {

    private final AuthorService authorService;

    public AuthorController(final AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping
    @Operation(summary = "Получить всех авторов")
    public List<AuthorDto> getAllAuthors() {
        return authorService.getAllAuthors();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить автора по ID")
    public AuthorDto getAuthorById(@PathVariable final Long id) {
        return authorService.getAuthorById(id);
    }

    @PostMapping
    @Operation(summary = "Создать автора")
    public AuthorDto createAuthor(
            @Valid @RequestBody final AuthorRequest request) {
        return authorService.createAuthor(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить автора")
    public AuthorDto updateAuthor(
            @PathVariable final Long id,
            @Valid @RequestBody final AuthorRequest request) {
        return authorService.updateAuthor(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить автора")
    public String deleteAuthor(@PathVariable final Long id) {
        authorService.deleteAuthor(id);
        return "Автор удален!";
    }
}