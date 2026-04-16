package com.example.bookreviews.service;

import com.example.bookreviews.cache.BookCacheManager;
import com.example.bookreviews.dto.CommentDto;
import com.example.bookreviews.dto.CommentRequest;
import com.example.bookreviews.exception.ResourceNotFoundException;
import com.example.bookreviews.mapper.CommentMapper;
import com.example.bookreviews.model.Book;
import com.example.bookreviews.model.Comment;
import com.example.bookreviews.model.Role;
import com.example.bookreviews.model.User;
import com.example.bookreviews.repository.BookRepository;
import com.example.bookreviews.repository.CommentRepository;
import com.example.bookreviews.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private BookRepository bookRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CommentMapper commentMapper;
    @Mock
    private BookCacheManager bookCacheManager;

    @InjectMocks
    private CommentService commentService;

    private Book testBook;
    private User testUser;
    private Comment testComment;
    private CommentDto testCommentDto;

    @BeforeEach
    void setUp() {
        testBook = new Book("Война и мир", 1225, 1869);
        testBook.setId(1L);

        testUser = new User("Иван", Role.USER);
        testUser.setId(1L);

        testComment = new Comment(
                "Отличная книга!", 8, testBook, testUser);
        testComment.setId(1L);

        testCommentDto = new CommentDto(
                1L, "Отличная книга!", 8,
                "Война и мир", "Иван");
    }

    @Test
    @DisplayName("getAllComments — возвращает список")
    void getAllComments_returnsAll() {
        when(commentRepository.findAll())
                .thenReturn(List.of(testComment));
        when(commentMapper.toDto(testComment))
                .thenReturn(testCommentDto);

        List<CommentDto> result =
                commentService.getAllComments();

        assertEquals(1, result.size());
        assertEquals("Отличная книга!",
                result.get(0).text());
    }

    @Test
    @DisplayName("getAllComments — пустой список")
    void getAllComments_empty() {
        when(commentRepository.findAll())
                .thenReturn(Collections.emptyList());

        assertTrue(
                commentService.getAllComments().isEmpty());
    }

    @Test
    @DisplayName("getCommentById — успех")
    void getCommentById_success() {
        when(commentRepository.findWithDetailsById(1L))
                .thenReturn(Optional.of(testComment));
        when(commentMapper.toDto(testComment))
                .thenReturn(testCommentDto);

        CommentDto result =
                commentService.getCommentById(1L);

        assertNotNull(result);
        assertEquals(8, result.rating());
    }

    @Test
    @DisplayName("getCommentById — не найден")
    void getCommentById_notFound() {
        when(commentRepository.findWithDetailsById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> commentService.getCommentById(99L));
    }

    @Test
    @DisplayName("createComment — успех")
    void createComment_success() {
        CommentRequest request = new CommentRequest(
                "Отличная книга!", 8, 1L, 1L);

        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(testBook));
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(testUser));
        when(commentRepository.save(any(Comment.class)))
                .thenReturn(testComment);
        when(commentMapper.toDto(any(Comment.class)))
                .thenReturn(testCommentDto);

        CommentDto result =
                commentService.createComment(request);

        assertNotNull(result);
        verify(commentRepository)
                .save(any(Comment.class));
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("createComment — книга не найдена")
    void createComment_bookNotFound() {
        CommentRequest request = new CommentRequest(
                "Текст", 5, 999L, 1L);

        when(bookRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> commentService
                        .createComment(request));
    }

    @Test
    @DisplayName("createComment — пользователь не найден")
    void createComment_userNotFound() {
        CommentRequest request = new CommentRequest(
                "Текст", 5, 1L, 999L);

        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(testBook));
        when(userRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> commentService
                        .createComment(request));
    }

    @Test
    @DisplayName("bulk С транзакцией — успех")
    void createBulkComments_success() {
        CommentRequest req1 = new CommentRequest(
                "Отлично!", 9, 1L, 1L);
        CommentRequest req2 = new CommentRequest(
                "Хорошо!", 7, 1L, 1L);

        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(testBook));
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(testUser));
        when(commentRepository.saveAll(anyList()))
                .thenReturn(
                        List.of(testComment, testComment));
        when(commentMapper.toDto(any(Comment.class)))
                .thenReturn(testCommentDto);

        List<CommentDto> result =
                commentService.createBulkComments(
                        List.of(req1, req2));

        assertEquals(2, result.size());
        verify(commentRepository, times(1))
                .saveAll(anyList());
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("bulk С транзакцией — книга не найдена")
    void createBulkComments_bookNotFound() {
        CommentRequest req = new CommentRequest(
                "Текст", 5, 999L, 1L);

        when(bookRepository.findById(999L))
                .thenReturn(Optional.empty());

        List<CommentRequest> requests = List.of(req);

        assertThrows(ResourceNotFoundException.class,
                () -> commentService
                        .createBulkComments(requests));
    }

    @Test
    @DisplayName("bulk БЕЗ транзакции — успех")
    void createBulkNoTx_success() {
        CommentRequest req = new CommentRequest(
                "Хорошо!", 7, 1L, 1L);

        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(testBook));
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(testUser));
        when(commentRepository.save(any(Comment.class)))
                .thenReturn(testComment);
        when(commentMapper.toDto(any(Comment.class)))
                .thenReturn(testCommentDto);

        List<CommentDto> result =
                commentService
                        .createBulkCommentsNoTransaction(
                                List.of(req));

        assertEquals(1, result.size());
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("bulk БЕЗ транзакции — частичное "
            + "сохранение")
    void createBulkNoTx_partialSave() {
        CommentRequest req1 = new CommentRequest(
                "Хорошо!", 7, 1L, 1L);
        CommentRequest req2 = new CommentRequest(
                "Плохо!", 3, 999L, 1L);

        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(testBook));
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(testUser));
        when(commentRepository.save(any(Comment.class)))
                .thenReturn(testComment);
        when(commentMapper.toDto(any(Comment.class)))
                .thenReturn(testCommentDto);
        when(bookRepository.findById(999L))
                .thenReturn(Optional.empty());

        List<CommentRequest> requests =
                List.of(req1, req2);

        assertThrows(ResourceNotFoundException.class,
                () -> commentService
                        .createBulkCommentsNoTransaction(
                                requests));

        verify(commentRepository, times(1))
                .save(any(Comment.class));
    }

    @Test
    @DisplayName("updateComment — успех")
    void updateComment_success() {
        CommentRequest request = new CommentRequest(
                "Обновленный", 9, 1L, 1L);

        when(commentRepository.findById(1L))
                .thenReturn(Optional.of(testComment));
        when(commentRepository.save(any(Comment.class)))
                .thenReturn(testComment);
        when(commentMapper.toDto(any(Comment.class)))
                .thenReturn(new CommentDto(
                        1L, "Обновленный", 9,
                        "Война и мир", "Иван"));

        CommentDto result =
                commentService.updateComment(1L, request);

        assertEquals("Обновленный", result.text());
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("updateComment — не найден")
    void updateComment_notFound() {
        CommentRequest request = new CommentRequest(
                "Текст", 5, 1L, 1L);

        when(commentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> commentService
                        .updateComment(99L, request));
    }


    @Test
    @DisplayName("deleteComment — успех")
    void deleteComment_success() {
        doNothing().when(commentRepository)
                .deleteById(1L);

        commentService.deleteComment(1L);

        verify(commentRepository).deleteById(1L);
        verify(bookCacheManager).invalidate();
    }
}