package com.example.bookreviews.dto;

public record CommentDto(Long id, String text, Integer rating, String bookTitle, String userName) {
}