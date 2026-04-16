package com.example.bookreviews.service;

import com.example.bookreviews.cache.BookCacheManager;
import com.example.bookreviews.dto.CommentDto;
import com.example.bookreviews.dto.CommentRequest;
import com.example.bookreviews.exception.ResourceNotFoundException;
import com.example.bookreviews.mapper.CommentMapper;
import com.example.bookreviews.model.Book;
import com.example.bookreviews.model.Comment;
import com.example.bookreviews.model.User;
import com.example.bookreviews.repository.BookRepository;
import com.example.bookreviews.repository.CommentRepository;
import com.example.bookreviews.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private static final Logger LOG =
            LoggerFactory.getLogger(CommentService.class);

    private static final String BOOK_NOT_FOUND_MSG =
            "Книга не найдена с id: ";
    private static final String USER_NOT_FOUND_MSG =
            "Пользователь не найден с id: ";
    private static final String COMMENT_NOT_FOUND_MSG =
            "Комментарий не найден с id: ";

    private final CommentRepository commentRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;
    private final BookCacheManager bookCacheManager;

    public CommentService(
            final CommentRepository commentRepository,
            final BookRepository bookRepository,
            final UserRepository userRepository,
            final CommentMapper commentMapper,
            final BookCacheManager bookCacheManager) {
        this.commentRepository = commentRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.commentMapper = commentMapper;
        this.bookCacheManager = bookCacheManager;
    }

    public List<CommentDto> getAllComments() {
        return commentRepository.findAll().stream()
                .map(commentMapper::toDto).toList();
    }

    public CommentDto getCommentById(final Long id) {
        Comment comment = commentRepository
                .findWithDetailsById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                COMMENT_NOT_FOUND_MSG + id));
        return commentMapper.toDto(comment);
    }

    @Transactional
    public CommentDto createComment(
            final CommentRequest request) {
        Comment comment = mapToEntity(request);
        Comment saved = commentRepository.save(comment);
        bookCacheManager.invalidate();
        return commentMapper.toDto(saved);
    }

    @Transactional
    public List<CommentDto> createBulkComments(
            final List<CommentRequest> requests) {
        LOG.info("Bulk-создание {} комментариев "
                        + "С транзакцией (saveAll)",
                requests.size());

        List<Comment> commentsToSave = requests.stream()
                .map(this::mapToEntity)
                .toList();

        List<Comment> savedComments =
                commentRepository.saveAll(commentsToSave);
        bookCacheManager.invalidate();
        LOG.info("Успешно сохранено {} комментариев",
                savedComments.size());

        return savedComments.stream()
                .map(commentMapper::toDto)
                .toList();
    }

    public List<CommentDto> createBulkCommentsNoTransaction(
            final List<CommentRequest> requests) {
        LOG.info("Bulk-создание {} комментариев "
                        + "БЕЗ транзакции",
                requests.size());

        List<CommentDto> result = requests.stream()
                .map(req -> {
                    Comment comment = mapToEntity(req);
                    Comment saved =
                            commentRepository.save(comment);
                    LOG.debug("Сохранён комментарий id={}",
                            saved.getId());
                    return commentMapper.toDto(saved);
                })
                .toList();

        bookCacheManager.invalidate();
        return result;
    }

    @Transactional
    public CommentDto updateComment(final Long id,
                                    final CommentRequest request) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                COMMENT_NOT_FOUND_MSG + id));

        comment.setText(request.text());
        comment.setRating(request.rating());

        Comment updated = commentRepository.save(comment);
        bookCacheManager.invalidate();
        return commentMapper.toDto(updated);
    }

    public void deleteComment(final Long id) {
        commentRepository.deleteById(id);
        bookCacheManager.invalidate();
    }

    private Comment mapToEntity(
            final CommentRequest request) {
        Book book = bookRepository
                .findById(request.bookId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                BOOK_NOT_FOUND_MSG
                                        + request.bookId()));

        User user = userRepository
                .findById(request.userId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                USER_NOT_FOUND_MSG
                                        + request.userId()));

        return new Comment(request.text(),
                request.rating(), book, user);
    }
}