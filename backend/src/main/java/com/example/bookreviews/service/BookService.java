package com.example.bookreviews.service;

import com.example.bookreviews.cache.BookCacheKey;
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
import com.example.bookreviews.model.Status;
import com.example.bookreviews.model.User;
import com.example.bookreviews.repository.AuthorRepository;
import com.example.bookreviews.repository.BookRepository;
import com.example.bookreviews.repository.CategoryRepository;
import com.example.bookreviews.repository.LogRepository;
import com.example.bookreviews.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class BookService {

    private static final Logger LOG =
            LoggerFactory.getLogger(BookService.class);
    private static final String BOOK_NOT_FOUND_MSG =
            "Книга не найдена с id: ";

    private final BookRepository bookRepository;
    private final LogRepository logRepository;
    private final UserRepository userRepository;
    private final BookMapper bookMapper;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final BookCacheManager bookCacheManager;

    public BookService(final BookRepository bookRepository,
                       final LogRepository logRepository,
                       final UserRepository userRepository,
                       final BookMapper bookMapper,
                       final AuthorRepository authorRepository,
                       final CategoryRepository categoryRepository,
                       final BookCacheManager bookCacheManager) {
        this.bookRepository = bookRepository;
        this.logRepository = logRepository;
        this.userRepository = userRepository;
        this.bookMapper = bookMapper;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
        this.bookCacheManager = bookCacheManager;
    }

    public List<BookDto> findAllBooks(final String title) {
        List<Book> books = (title != null && !title.isEmpty())
                ? bookRepository
                .findByTitleContainingIgnoreCase(title)
                : bookRepository.findAllByOrderByIdAsc();
        return books.stream().map(bookMapper::toDto).toList();
    }

    public BookDto findBookById(final Long id) {
        return bookRepository.findWithDetailsById(id)
                .map(bookMapper::toDto)
                .orElseThrow(() -> {
                    User admin = userRepository.findById(1L)
                            .orElse(null);
                    logRepository.save(new Log(Status.FAILURE,
                            "Неудачная попытка найти книгу: " + id,
                            admin));
                    return new ResourceNotFoundException(
                            BOOK_NOT_FOUND_MSG + id);
                });
    }

    @Transactional(readOnly = true)
    public List<BookDto> findBooksByFilter(
            final String authorLastName,
            final String categoryName,
            final Integer rating,
            final int page,
            final int size,
            final boolean useNative) {

        BookCacheKey cacheKey = new BookCacheKey(
                authorLastName, categoryName, rating, page, size);

        List<BookDto> cached = bookCacheManager.get(cacheKey);
        if (cached != null) {
            LOG.info("Возвращаем {} книг из кеша",
                    cached.size());
            return cached;
        }

        Pageable pageable = PageRequest.of(page, size);
        List<BookDto> result;

        if (useNative) {
            LOG.info("Используем NATIVE query "
                    + "(Строго 1 SQL запрос)");
            List<BookFilterResult> rawResults =
                    bookRepository.findBooksByFilterNativeReal(
                            authorLastName, categoryName,
                            rating, pageable);

            result = rawResults.stream().map(row -> {
                List<String> authors =
                        row.getAuthorNames() != null
                                ? Arrays.asList(
                                row.getAuthorNames()
                                        .split("\\|"))
                                : Collections.emptyList();
                List<String> categories =
                        row.getCategoryNames() != null
                                ? Arrays.asList(
                                row.getCategoryNames()
                                        .split("\\|"))
                                : Collections.emptyList();
                List<String> comments =
                        row.getCommentTexts() != null
                                ? Arrays.asList(
                                row.getCommentTexts()
                                        .split("\\|"))
                                : Collections.emptyList();

                return new BookDto(
                        row.getId(), row.getTitle(),
                        row.getPages(),
                        row.getPublicationYear(),
                        authors, categories, comments);
            }).toList();
        } else {
            LOG.info("Используем JPQL query (1 запрос)");
            List<Book> books =
                    bookRepository.findBooksByFilterJpql(
                            authorLastName, categoryName,
                            rating, pageable);
            result = books.stream()
                    .map(bookMapper::toDto).toList();
        }

        bookCacheManager.put(cacheKey, result);
        LOG.info("Найдено {} книг", result.size());
        return result;
    }

    @Transactional
    public BookDto createBook(final BookRequest request) {
        Book book = new Book(request.title(), request.pages(),
                request.publicationYear());

        if (request.authorIds() != null
                && !request.authorIds().isEmpty()) {
            List<Author> authors = authorRepository
                    .findAllById(request.authorIds());
            book.getAuthors().addAll(authors);
        }
        if (request.categoryIds() != null
                && !request.categoryIds().isEmpty()) {
            List<Category> categories = categoryRepository
                    .findAllById(request.categoryIds());
            book.getCategories().addAll(categories);
        }

        Book savedBook = bookRepository.save(book);
        User admin = userRepository.findById(1L).orElse(null);
        logRepository.save(new Log(Status.SUCCESS,
                "Создана книга: " + request.title(), admin));
        bookCacheManager.invalidate();
        return bookMapper.toDto(savedBook);
    }

    @Transactional
    public BookDto updateBook(final Long id,
                              final BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        BOOK_NOT_FOUND_MSG + id));

        book.setTitle(request.title());
        book.setPages(request.pages());
        book.setPublicationYear(request.publicationYear());

        book.getAuthors().clear();
        if (request.authorIds() != null
                && !request.authorIds().isEmpty()) {
            book.getAuthors().addAll(authorRepository
                    .findAllById(request.authorIds()));
        }
        book.getCategories().clear();
        if (request.categoryIds() != null
                && !request.categoryIds().isEmpty()) {
            book.getCategories().addAll(categoryRepository
                    .findAllById(request.categoryIds()));
        }

        Book updatedBook = bookRepository.save(book);
        bookCacheManager.invalidate();
        return bookMapper.toDto(updatedBook);
    }

    @Transactional
    public BookDto patchBook(final Long id,
                             final BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        BOOK_NOT_FOUND_MSG + id));

        if (request.title() != null) {
            book.setTitle(request.title());
        }
        if (request.pages() > 0) {
            book.setPages(request.pages());
        }
        if (request.publicationYear() != null) {
            book.setPublicationYear(request.publicationYear());
        }
        if (request.authorIds() != null) {
            book.getAuthors().clear();
            if (!request.authorIds().isEmpty()) {
                book.getAuthors().addAll(authorRepository
                        .findAllById(request.authorIds()));
            }
        }
        if (request.categoryIds() != null) {
            book.getCategories().clear();
            if (!request.categoryIds().isEmpty()) {
                book.getCategories().addAll(categoryRepository
                        .findAllById(request.categoryIds()));
            }
        }

        Book patchedBook = bookRepository.save(book);
        bookCacheManager.invalidate();
        return bookMapper.toDto(patchedBook);
    }

    public void deleteBook(final Long id) {
        bookRepository.deleteById(id);
        bookCacheManager.invalidate();
    }

    public void demoWithoutTransaction() {
        User admin = userRepository.findById(1L).orElse(null);
        logRepository.save(new Log(Status.IN_PROGRESS,
                "Попытка сохранить БЕЗ транзакции", admin));
        throw new IllegalStateException(
                "Искусственная ошибка БД!");
    }

    @Transactional
    public void demoWithTransaction() {
        User admin = userRepository.findById(1L).orElse(null);
        logRepository.save(new Log(Status.IN_PROGRESS,
                "Попытка сохранить С транзакцией", admin));
        throw new IllegalStateException(
                "Искусственная ошибка БД!");
    }
}