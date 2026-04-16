package com.example.bookreviews.dto;

import java.util.List;

public record BookDto(
        Long id,
        String title,
        int pages,
        Integer publicationYear,
        List<String> authors,
        List<String> categories,
        List<String> comments
) {

}