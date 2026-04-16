package com.example.bookreviews.mapper;

import com.example.bookreviews.dto.UserDto;
import com.example.bookreviews.model.Comment;
import com.example.bookreviews.model.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public final class UserMapper {

    public UserDto toDto(final User user) {
        List<String> commentTexts = user.getComments().stream()
                .map(Comment::getText)
                .toList();

        return new UserDto(
                user.getId(),
                user.getName(),
                user.getRole().name(),
                commentTexts
        );
    }
}