package com.example.bookreviews.dto;

import java.util.List;

public record AuthorDto(Long id, String firstName, String lastName, List<String> books) {

}