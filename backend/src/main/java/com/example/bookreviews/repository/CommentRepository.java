package com.example.bookreviews.repository;

import com.example.bookreviews.model.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @NonNull
    @EntityGraph(attributePaths = {"book", "user"})
    List<Comment> findAll();

    @NonNull
    @EntityGraph(attributePaths = {"book", "user"})
    Optional<Comment> findWithDetailsById(Long id);
}