package com.example.bookreviews.dto;

import java.util.List;

public record CategoryDto(Long id, String name, List<String> books) {

}