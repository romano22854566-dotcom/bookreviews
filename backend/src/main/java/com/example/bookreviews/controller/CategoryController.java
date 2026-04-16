package com.example.bookreviews.controller;

import com.example.bookreviews.dto.CategoryDto;
import com.example.bookreviews.dto.CategoryRequest;
import com.example.bookreviews.service.CategoryService;
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
@RequestMapping("/categories")
@Tag(name = "Категории", description = "CRUD-операции с категориями")
public  class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(
            final CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Получить все категории")
    public List<CategoryDto> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить категорию по ID")
    public CategoryDto getCategoryById(
            @PathVariable final Long id) {
        return categoryService.getCategoryById(id);
    }

    @PostMapping
    @Operation(summary = "Создать категорию")
    public CategoryDto createCategory(
            @Valid @RequestBody final CategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить категорию")
    public CategoryDto updateCategory(
            @PathVariable final Long id,
            @Valid @RequestBody final CategoryRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить категорию")
    public String deleteCategory(@PathVariable final Long id) {
        categoryService.deleteCategory(id);
        return "Категория с id " + id + " удалена!";
    }
}