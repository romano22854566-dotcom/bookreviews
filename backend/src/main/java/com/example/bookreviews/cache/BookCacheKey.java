package com.example.bookreviews.cache;

public record BookCacheKey(
        String authorLastName,
        String categoryName,
        Integer rating,
        int page,
        int size
) {
}