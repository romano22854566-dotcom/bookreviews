package com.example.bookreviews.controller;

import com.example.bookreviews.dto.BookDto;
import com.example.bookreviews.dto.BookRequest;
import com.example.bookreviews.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/books")
@Tag(name = "Книги", description = "CRUD-операции с книгами")
public  class BookController {

    private final BookService bookService;

    public BookController(final BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    @Operation(summary = "Получить все книги",
            description = "Можно фильтровать по названию")
    public List<BookDto> getAllBooks(
            @RequestParam(required = false) final String title) {
        return bookService.findAllBooks(title);
    }

    @GetMapping("/filter/jpql")
    @Operation(summary = "Фильтр книг (JPQL)")
    public List<BookDto> filterBooksJpql(
            @RequestParam(required = false) final String authorLastName,
            @RequestParam(required = false) final String categoryName,
            @RequestParam(required = false) final Integer rating,
            @RequestParam(defaultValue = "0") final int page,
            @RequestParam(defaultValue = "10") final int size) {
        return bookService.findBooksByFilter(
                authorLastName, categoryName, rating,
                page, size, false);
    }

    @GetMapping("/filter/native")
    @Operation(summary = "Фильтр книг (Native SQL)")
    public List<BookDto> filterBooksNative(
            @RequestParam(required = false) final String authorLastName,
            @RequestParam(required = false) final String categoryName,
            @RequestParam(required = false) final Integer rating,
            @RequestParam(defaultValue = "0") final int page,
            @RequestParam(defaultValue = "10") final int size) {
        return bookService.findBooksByFilter(
                authorLastName, categoryName, rating,
                page, size, true);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить книгу по ID")
    public BookDto getBookById(@PathVariable final Long id) {
        return bookService.findBookById(id);
    }

    @PostMapping
    @Operation(summary = "Создать книгу")
    public BookDto createBook(
            @Valid @RequestBody final BookRequest request) {
        return bookService.createBook(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Полное обновление книги")
    public BookDto updateBook(
            @PathVariable final Long id,
            @Valid @RequestBody final BookRequest request) {
        return bookService.updateBook(id, request);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Частичное обновление книги")
    public BookDto patchBook(
            @PathVariable final Long id,
            @RequestBody final BookRequest request) {
        return bookService.patchBook(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить книгу")
    public String deleteBook(@PathVariable final Long id) {
        bookService.deleteBook(id);
        return "Книга с id " + id + " удалена!";
    }

    @GetMapping("/demo/no-transaction")
    @Operation(summary = "Демо: без транзакции")
    public String demoNoTrans() {
        try {
            bookService.demoWithoutTransaction();
        } catch (Exception e) {
            return "Ошибка! Но лог сохранен.";
        }
        return "Успех";
    }

    @GetMapping("/demo/with-transaction")
    @Operation(summary = "Демо: с транзакцией")
    public String demoTrans() {
        try {
            bookService.demoWithTransaction();
        } catch (Exception e) {
            return "Ошибка! Лог ОТКАТИЛСЯ.";
        }
        return "Успех";
    }
}