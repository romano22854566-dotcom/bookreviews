package com.example.bookreviews.mapper;

import com.example.bookreviews.dto.CommentDto;
import com.example.bookreviews.model.Comment;
import org.springframework.stereotype.Component;

@Component
public final class CommentMapper {

    public CommentDto toDto(final Comment comment) {
        return new CommentDto(
                comment.getId(),
                comment.getText(),
                comment.getRating(),
                comment.getBook().getTitle(),
                comment.getUser().getName()
        );
    }
}