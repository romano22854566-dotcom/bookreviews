package com.example.bookreviews.dto;

public interface BookFilterResult {
    Long getId();

    String getTitle();

    Integer getPages();

    Integer getPublicationYear();

    String getAuthorNames();

    String getCategoryNames();

    String getCommentTexts();
}