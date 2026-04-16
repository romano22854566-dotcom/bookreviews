package com.example.bookreviews.service;

import com.example.bookreviews.cache.BookCacheManager;
import com.example.bookreviews.dto.BookDto;
import com.example.bookreviews.dto.BookFilterResult;
import com.example.bookreviews.dto.BookRequest;
import com.example.bookreviews.exception.ResourceNotFoundException;
import com.example.bookreviews.mapper.BookMapper;
import com.example.bookreviews.model.Author;
import com.example.bookreviews.model.Book;
import com.example.bookreviews.model.Category;
import com.example.bookreviews.model.Log;
import com.example.bookreviews.model.Role;
import com.example.bookreviews.model.User;
import com.example.bookreviews.repository.AuthorRepository;
import com.example.bookreviews.repository.BookRepository;
import com.example.bookreviews.repository.CategoryRepository;
import com.example.bookreviews.repository.LogRepository;
import com.example.bookreviews.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;
    @Mock
    private LogRepository logRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BookMapper bookMapper;
    @Mock
    private AuthorRepository authorRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private BookCacheManager bookCacheManager;

    @InjectMocks
    private BookService bookService;

    private Book testBook;
    private BookDto testBookDto;
    private User adminUser;
    private Author testAuthor;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testBook = new Book("Война и мир", 1225, 1869);
        testBook.setId(1L);

        testBookDto = new BookDto(
                1L, "Война и мир", 1225, 1869,
                List.of("Лев Толстой"),
                List.of("Роман"),
                Collections.emptyList());

        adminUser = new User("Admin", Role.ADMIN);
        adminUser.setId(1L);

        testAuthor = new Author("Лев", "Толстой");
        testAuthor.setId(1L);

        testCategory = new Category("Роман");
        testCategory.setId(1L);
    }

    @Test
    @DisplayName("findAllBooks — title = null")
    void findAllBooks_nullTitle() {
        when(bookRepository.findAllByOrderByIdAsc()).thenReturn(List.of(testBook));
        when(bookMapper.toDto(testBook)).thenReturn(testBookDto);
        List<BookDto> result = bookService.findAllBooks(null);
        assertEquals(1, result.size());
        verify(bookRepository).findAllByOrderByIdAsc();
    }

    @Test
    @DisplayName("findAllBooks — title = пустая строка")
    void findAllBooks_emptyTitle() {
        when(bookRepository.findAllByOrderByIdAsc()).thenReturn(List.of(testBook));
        when(bookMapper.toDto(testBook)).thenReturn(testBookDto);
        List<BookDto> result = bookService.findAllBooks("");
        assertEquals(1, result.size());
        verify(bookRepository).findAllByOrderByIdAsc();
    }

    @Test
    @DisplayName("findAllBooks — с фильтром по названию")
    void findAllBooks_withTitle() {
        when(bookRepository.findByTitleContainingIgnoreCase("Война")).thenReturn(List.of(testBook));
        when(bookMapper.toDto(testBook)).thenReturn(testBookDto);
        List<BookDto> result = bookService.findAllBooks("Война");
        assertEquals(1, result.size());
        verify(bookRepository).findByTitleContainingIgnoreCase("Война");
    }

    @Test
    @DisplayName("findAllBooks — пустой результат")
    void findAllBooks_empty() {
        when(bookRepository.findAllByOrderByIdAsc()).thenReturn(Collections.emptyList());
        assertTrue(bookService.findAllBooks(null).isEmpty());
    }

    @Test
    @DisplayName("findBookById — успех")
    void findBookById_success() {
        when(bookRepository.findWithDetailsById(1L)).thenReturn(Optional.of(testBook));
        when(bookMapper.toDto(testBook)).thenReturn(testBookDto);
        BookDto result = bookService.findBookById(1L);
        assertNotNull(result);
        assertEquals("Война и мир", result.title());
    }

    @Test
    @DisplayName("findBookById — не найдена, admin существует")
    void findBookById_notFound_adminExists() {
        when(bookRepository.findWithDetailsById(99L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(logRepository.save(any(Log.class))).thenReturn(new Log());
        assertThrows(ResourceNotFoundException.class, () -> bookService.findBookById(99L));
        verify(logRepository).save(any(Log.class));
    }

    @Test
    @DisplayName("findBookById — не найдена, admin не существует")
    void findBookById_notFound_adminNull() {
        when(bookRepository.findWithDetailsById(99L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        when(logRepository.save(any(Log.class))).thenReturn(new Log());
        assertThrows(ResourceNotFoundException.class, () -> bookService.findBookById(99L));
    }

    @Test
    @DisplayName("findBooksByFilter — кеш попадание")
    void findBooksByFilter_cacheHit() {
        when(bookCacheManager.get(any())).thenReturn(List.of(testBookDto));
        List<BookDto> result = bookService.findBooksByFilter("Толстой", null, null, 0, 10, false);
        assertEquals(1, result.size());
        verify(bookRepository, never()).findBooksByFilterJpql(any(), any(), any(), any());
        verify(bookRepository, never()).findBooksByFilterNativeReal(any(), any(), any(), any());
    }

    @Test
    @DisplayName("findBooksByFilter — JPQL, кеш промах")
    void findBooksByFilter_jpql() {
        when(bookCacheManager.get(any())).thenReturn(null);
        when(bookRepository.findBooksByFilterJpql(any(), any(), any(), any(Pageable.class))).thenReturn(List.of(testBook));
        when(bookMapper.toDto(any())).thenReturn(testBookDto);
        List<BookDto> result = bookService.findBooksByFilter("Толстой", null, null, 0, 10, false);
        assertEquals(1, result.size());
        verify(bookCacheManager).put(any(), anyList());
    }

    @Test
    @DisplayName("findBooksByFilter — Native, поля НЕ null")
    void findBooksByFilter_nativeNonNull() {
        when(bookCacheManager.get(any())).thenReturn(null);
        BookFilterResult row = mock(BookFilterResult.class);
        when(row.getId()).thenReturn(1L);
        when(row.getTitle()).thenReturn("Книга");
        when(row.getPages()).thenReturn(100);
        when(row.getPublicationYear()).thenReturn(2020);
        when(row.getAuthorNames()).thenReturn("Автор Один|Автор Два");
        when(row.getCategoryNames()).thenReturn("Категория");
        when(row.getCommentTexts()).thenReturn("[8/10] Хорошо");
        when(bookRepository.findBooksByFilterNativeReal(any(), any(), any(), any(Pageable.class))).thenReturn(List.of(row));
        List<BookDto> result = bookService.findBooksByFilter(null, null, null, 0, 10, true);
        assertEquals(1, result.size());
        assertEquals(2, result.get(0).authors().size());
    }

    @Test
    @DisplayName("findBooksByFilter — Native, поля null")
    void findBooksByFilter_nativeNull() {
        when(bookCacheManager.get(any())).thenReturn(null);
        BookFilterResult row = mock(BookFilterResult.class);
        when(row.getId()).thenReturn(1L);
        when(row.getTitle()).thenReturn("Книга");
        when(row.getPages()).thenReturn(100);
        when(row.getPublicationYear()).thenReturn(2020);
        when(row.getAuthorNames()).thenReturn(null);
        when(row.getCategoryNames()).thenReturn(null);
        when(row.getCommentTexts()).thenReturn(null);
        when(bookRepository.findBooksByFilterNativeReal(any(), any(), any(), any(Pageable.class))).thenReturn(List.of(row));
        List<BookDto> result = bookService.findBooksByFilter(null, null, null, 0, 10, true);
        assertEquals(1, result.size());
        assertTrue(result.get(0).authors().isEmpty());
        assertTrue(result.get(0).categories().isEmpty());
        assertTrue(result.get(0).comments().isEmpty());
    }

    @Test
    @DisplayName("createBook — без авторов и категорий")
    void createBook_noAuthorsNoCategories() {
        BookRequest request = new BookRequest("Книга", 300, 2023, null, null);
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(logRepository.save(any(Log.class))).thenReturn(new Log());
        when(bookMapper.toDto(any(Book.class))).thenReturn(testBookDto);
        BookDto result = bookService.createBook(request);
        assertNotNull(result);
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("createBook — с авторами и категориями")
    void createBook_withAuthorsAndCategories() {
        BookRequest request = new BookRequest("Книга", 300, 2023, List.of(1L), List.of(1L));
        when(authorRepository.findAllById(List.of(1L))).thenReturn(List.of(testAuthor));
        when(categoryRepository.findAllById(List.of(1L))).thenReturn(List.of(testCategory));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(logRepository.save(any(Log.class))).thenReturn(new Log());
        when(bookMapper.toDto(any(Book.class))).thenReturn(testBookDto);
        BookDto result = bookService.createBook(request);
        assertNotNull(result);
        verify(authorRepository).findAllById(List.of(1L));
        verify(categoryRepository).findAllById(List.of(1L));
    }

    @Test
    @DisplayName("createBook — пустые списки ID")
    void createBook_emptyLists() {
        BookRequest request = new BookRequest("Книга", 300, 2023, List.of(), List.of());
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(logRepository.save(any(Log.class))).thenReturn(new Log());
        when(bookMapper.toDto(any(Book.class))).thenReturn(testBookDto);
        bookService.createBook(request);
        verify(authorRepository, never()).findAllById(anyList());
        verify(categoryRepository, never()).findAllById(anyList());
    }

    @Test
    @DisplayName("updateBook — с авторами и категориями")
    void updateBook_withAuthorsAndCategories() {
        BookRequest request = new BookRequest("Новая", 500, 2024, List.of(1L), List.of(1L));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(authorRepository.findAllById(List.of(1L))).thenReturn(List.of(testAuthor));
        when(categoryRepository.findAllById(List.of(1L))).thenReturn(List.of(testCategory));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);
        when(bookMapper.toDto(any(Book.class))).thenReturn(testBookDto);
        BookDto result = bookService.updateBook(1L, request);
        assertNotNull(result);
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("updateBook — null списки")
    void updateBook_nullLists() {
        BookRequest request = new BookRequest("Новая", 500, 2024, null, null);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);
        when(bookMapper.toDto(any(Book.class))).thenReturn(testBookDto);
        bookService.updateBook(1L, request);
        verify(authorRepository, never()).findAllById(anyList());
    }

    @Test
    @DisplayName("updateBook — пустые списки")
    void updateBook_emptyLists() {
        BookRequest request = new BookRequest("Новая", 500, 2024, List.of(), List.of());
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);
        when(bookMapper.toDto(any(Book.class))).thenReturn(testBookDto);
        bookService.updateBook(1L, request);
        verify(authorRepository, never()).findAllById(anyList());
    }

    @Test
    @DisplayName("updateBook — не найдена")
    void updateBook_notFound() {
        BookRequest request = new BookRequest("Новая", 500, 2024, null, null);
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> bookService.updateBook(99L, request));
    }

    @Test
    @DisplayName("patchBook — все поля заданы")
    void patchBook_allFieldsSet() {
        BookRequest request = new BookRequest("Новая", 500, 2024, List.of(1L), List.of(1L));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(authorRepository.findAllById(List.of(1L))).thenReturn(List.of(testAuthor));
        when(categoryRepository.findAllById(List.of(1L))).thenReturn(List.of(testCategory));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);
        when(bookMapper.toDto(any(Book.class))).thenReturn(testBookDto);
        BookDto result = bookService.patchBook(1L, request);
        assertNotNull(result);
    }

    @Test
    @DisplayName("patchBook — все поля null/0")
    void patchBook_noFieldsSet() {
        BookRequest request = new BookRequest(null, 0, null, null, null);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);
        when(bookMapper.toDto(any(Book.class))).thenReturn(testBookDto);
        bookService.patchBook(1L, request);
        verify(authorRepository, never()).findAllById(anyList());
        verify(categoryRepository, never()).findAllById(anyList());
    }

    @Test
    @DisplayName("patchBook — пустые списки ID")
    void patchBook_emptyLists() {
        BookRequest request = new BookRequest(null, 0, null, List.of(), List.of());
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);
        when(bookMapper.toDto(any(Book.class))).thenReturn(testBookDto);
        bookService.patchBook(1L, request);
        verify(authorRepository, never()).findAllById(anyList());
        verify(categoryRepository, never()).findAllById(anyList());
    }

    @Test
    @DisplayName("patchBook — не найдена")
    void patchBook_notFound() {
        BookRequest request = new BookRequest(null, 0, null, null, null);
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> bookService.patchBook(99L, request));
    }

    @Test
    @DisplayName("deleteBook — успех")
    void deleteBook_success() {
        doNothing().when(bookRepository).deleteById(1L);
        bookService.deleteBook(1L);
        verify(bookRepository).deleteById(1L);
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("demoWithoutTransaction — лог сохраняется")
    void demoWithoutTransaction_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(logRepository.save(any(Log.class))).thenReturn(new Log());
        assertThrows(IllegalStateException.class, () -> bookService.demoWithoutTransaction());
        verify(logRepository).save(any(Log.class));
    }

    @Test
    @DisplayName("demoWithTransaction — бросает исключение")
    void demoWithTransaction_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(logRepository.save(any(Log.class))).thenReturn(new Log());
        assertThrows(IllegalStateException.class, () -> bookService.demoWithTransaction());
    }
}