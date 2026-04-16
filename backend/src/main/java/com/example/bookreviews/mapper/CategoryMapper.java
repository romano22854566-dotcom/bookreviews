package com.example.bookreviews.mapper;

import com.example.bookreviews.dto.CategoryDto;
import com.example.bookreviews.model.Book;
import com.example.bookreviews.model.Category;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public final class CategoryMapper {

    public CategoryDto toDto(final Category category) {
        List<String> bookTitles = category.getBooks().stream()
                .map(Book::getTitle)
                .toList();

        return new CategoryDto(
                category.getId(),
                category.getName(),
                bookTitles
        );
    }
}