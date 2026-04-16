package com.example.bookreviews.service;

import com.example.bookreviews.cache.BookCacheManager;
import com.example.bookreviews.dto.AuthorDto;
import com.example.bookreviews.dto.AuthorRequest;
import com.example.bookreviews.exception.ResourceNotFoundException;
import com.example.bookreviews.mapper.AuthorMapper;
import com.example.bookreviews.model.Author;
import com.example.bookreviews.repository.AuthorRepository;
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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorServiceTest {

    @Mock
    private AuthorRepository authorRepository;
    @Mock
    private AuthorMapper authorMapper;
    @Mock
    private BookCacheManager bookCacheManager;

    @InjectMocks
    private AuthorService authorService;

    private Author testAuthor;
    private AuthorDto testAuthorDto;

    @BeforeEach
    void setUp() {
        testAuthor = new Author("Лев", "Толстой");
        testAuthor.setId(1L);

        testAuthorDto = new AuthorDto(
                1L, "Лев", "Толстой",
                List.of("Война и мир"));
    }

    @Test
    @DisplayName("getAllAuthors — возвращает список")
    void getAllAuthors_returnsList() {
        when(authorRepository.findAll())
                .thenReturn(List.of(testAuthor));
        when(authorMapper.toDto(testAuthor))
                .thenReturn(testAuthorDto);

        List<AuthorDto> result = authorService.getAllAuthors();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Лев", result.get(0).firstName());
        assertEquals("Толстой", result.get(0).lastName());
    }

    @Test
    @DisplayName("getAllAuthors — пустой список")
    void getAllAuthors_empty() {
        when(authorRepository.findAll())
                .thenReturn(Collections.emptyList());

        List<AuthorDto> result = authorService.getAllAuthors();

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("getAuthorById — успех")
    void getAuthorById_success() {
        when(authorRepository.findWithDetailsById(1L))
                .thenReturn(Optional.of(testAuthor));
        when(authorMapper.toDto(testAuthor))
                .thenReturn(testAuthorDto);

        AuthorDto result = authorService.getAuthorById(1L);

        assertNotNull(result);
        assertEquals("Лев", result.firstName());
        assertEquals("Толстой", result.lastName());
    }

    @Test
    @DisplayName("getAuthorById — не найден")
    void getAuthorById_notFound() {
        when(authorRepository.findWithDetailsById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> authorService.getAuthorById(99L));
    }

    @Test
    @DisplayName("createAuthor — успех")
    void createAuthor_success() {
        AuthorRequest request =
                new AuthorRequest("Фёдор", "Достоевский");

        Author savedAuthor =
                new Author("Фёдор", "Достоевский");
        savedAuthor.setId(2L);

        AuthorDto savedDto = new AuthorDto(
                2L, "Фёдор", "Достоевский",
                Collections.emptyList());

        when(authorRepository.save(any(Author.class)))
                .thenReturn(savedAuthor);
        when(authorMapper.toDto(savedAuthor))
                .thenReturn(savedDto);

        AuthorDto result = authorService.createAuthor(request);

        assertNotNull(result);
        assertEquals("Фёдор", result.firstName());
        assertEquals("Достоевский", result.lastName());
        verify(authorRepository).save(any(Author.class));
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("updateAuthor — успех")
    void updateAuthor_success() {
        AuthorRequest request =
                new AuthorRequest("Александр", "Пушкин");

        when(authorRepository.findById(1L))
                .thenReturn(Optional.of(testAuthor));
        when(authorRepository.save(any(Author.class)))
                .thenReturn(testAuthor);
        when(authorMapper.toDto(any(Author.class)))
                .thenReturn(new AuthorDto(
                        1L, "Александр", "Пушкин",
                        Collections.emptyList()));

        AuthorDto result =
                authorService.updateAuthor(1L, request);

        assertNotNull(result);
        assertEquals("Александр", result.firstName());
        assertEquals("Пушкин", result.lastName());
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("updateAuthor — не найден")
    void updateAuthor_notFound() {
        AuthorRequest request =
                new AuthorRequest("Имя", "Фамилия");

        when(authorRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> authorService.updateAuthor(99L, request));
    }

    @Test
    @DisplayName("deleteAuthor — успех")
    void deleteAuthor_success() {
        doNothing().when(authorRepository).deleteById(1L);

        authorService.deleteAuthor(1L);

        verify(authorRepository).deleteById(1L);
        verify(bookCacheManager).invalidate();
    }
}