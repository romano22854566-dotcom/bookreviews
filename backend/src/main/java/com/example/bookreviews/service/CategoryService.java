package com.example.bookreviews.service;

import com.example.bookreviews.cache.BookCacheManager;
import com.example.bookreviews.dto.CategoryDto;
import com.example.bookreviews.dto.CategoryRequest;
import com.example.bookreviews.exception.ResourceNotFoundException;
import com.example.bookreviews.mapper.CategoryMapper;
import com.example.bookreviews.model.Category;
import com.example.bookreviews.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final BookCacheManager bookCacheManager;

    public CategoryService(
            final CategoryRepository categoryRepository,
            final CategoryMapper categoryMapper,
            final BookCacheManager bookCacheManager) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
        this.bookCacheManager = bookCacheManager;
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toDto).toList();
    }

    public CategoryDto getCategoryById(final Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Категория не найдена с id: " + id));
        return categoryMapper.toDto(category);
    }

    public CategoryDto createCategory(
            final CategoryRequest request) {
        Category category = new Category(request.name());
        Category saved = categoryRepository.save(category);
        bookCacheManager.invalidate();
        return categoryMapper.toDto(saved);
    }

    public CategoryDto updateCategory(final Long id,
                                      final CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Категория не найдена с id: " + id));
        category.setName(request.name());
        Category updated = categoryRepository.save(category);
        bookCacheManager.invalidate();
        return categoryMapper.toDto(updated);
    }

    public void deleteCategory(final Long id) {
        categoryRepository.deleteById(id);
        bookCacheManager.invalidate();
    }
}