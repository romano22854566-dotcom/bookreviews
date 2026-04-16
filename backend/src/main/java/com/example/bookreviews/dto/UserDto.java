package com.example.bookreviews.dto;

import java.util.List;

public record UserDto(Long id, String name, String role, List<String> comments) {
    
}