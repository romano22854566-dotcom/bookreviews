package com.example.bookreviews.mapper;

import com.example.bookreviews.dto.AuthorDto;
import com.example.bookreviews.model.Author;
import com.example.bookreviews.model.Book;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public final class AuthorMapper {

    public AuthorDto toDto(final Author author) {
        List<String> bookTitles = author.getBooks().stream()
                .map(Book::getTitle)
                .toList();

        return new AuthorDto(author.getId(), author.getFirstName(), author.getLastName(), bookTitles);
    }
}