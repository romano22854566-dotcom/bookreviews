package com.example.bookreviews.service;

import com.example.bookreviews.cache.BookCacheManager;
import com.example.bookreviews.dto.AuthorDto;
import com.example.bookreviews.dto.AuthorRequest;
import com.example.bookreviews.exception.ResourceNotFoundException;
import com.example.bookreviews.mapper.AuthorMapper;
import com.example.bookreviews.model.Author;
import com.example.bookreviews.repository.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;
    private final BookCacheManager bookCacheManager;

    public AuthorService(final AuthorRepository authorRepository,
                         final AuthorMapper authorMapper,
                         final BookCacheManager bookCacheManager) {
        this.authorRepository = authorRepository;
        this.authorMapper = authorMapper;
        this.bookCacheManager = bookCacheManager;
    }

    public List<AuthorDto> getAllAuthors() {
        return authorRepository.findAll().stream()
                .map(authorMapper::toDto).toList();
    }

    public AuthorDto getAuthorById(final Long id) {
        Author author = authorRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Автор не найден с id: " + id));
        return authorMapper.toDto(author);
    }

    public AuthorDto createAuthor(final AuthorRequest request) {
        Author author = new Author(
                request.firstName(), request.lastName());
        Author savedAuthor = authorRepository.save(author);
        bookCacheManager.invalidate();
        return authorMapper.toDto(savedAuthor);
    }

    public AuthorDto updateAuthor(final Long id,
                                  final AuthorRequest request) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Автор не найден с id: " + id));
        author.setFirstName(request.firstName());
        author.setLastName(request.lastName());
        Author updatedAuthor = authorRepository.save(author);
        bookCacheManager.invalidate();
        return authorMapper.toDto(updatedAuthor);
    }

    public void deleteAuthor(final Long id) {
        authorRepository.deleteById(id);
        bookCacheManager.invalidate();
    }
}