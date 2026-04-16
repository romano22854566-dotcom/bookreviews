package com.example.bookreviews.service;

import com.example.bookreviews.cache.BookCacheManager;
import com.example.bookreviews.dto.CategoryDto;
import com.example.bookreviews.dto.CategoryRequest;
import com.example.bookreviews.exception.ResourceNotFoundException;
import com.example.bookreviews.mapper.CategoryMapper;
import com.example.bookreviews.model.Category;
import com.example.bookreviews.repository.CategoryRepository;
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
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private CategoryMapper categoryMapper;
    @Mock
    private BookCacheManager bookCacheManager;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;
    private CategoryDto testCategoryDto;

    @BeforeEach
    void setUp() {
        testCategory = new Category("Роман");
        testCategory.setId(1L);

        testCategoryDto = new CategoryDto(
                1L, "Роман",
                List.of("Война и мир"));
    }

    @Test
    @DisplayName("getAllCategories — возвращает список")
    void getAllCategories_returnsList() {
        when(categoryRepository.findAll())
                .thenReturn(List.of(testCategory));
        when(categoryMapper.toDto(testCategory))
                .thenReturn(testCategoryDto);

        List<CategoryDto> result =
                categoryService.getAllCategories();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Роман", result.get(0).name());
    }

    @Test
    @DisplayName("getAllCategories — пустой список")
    void getAllCategories_empty() {
        when(categoryRepository.findAll())
                .thenReturn(Collections.emptyList());

        List<CategoryDto> result =
                categoryService.getAllCategories();

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("getCategoryById — успех")
    void getCategoryById_success() {
        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(testCategory));
        when(categoryMapper.toDto(testCategory))
                .thenReturn(testCategoryDto);

        CategoryDto result =
                categoryService.getCategoryById(1L);

        assertNotNull(result);
        assertEquals("Роман", result.name());
    }

    @Test
    @DisplayName("getCategoryById — не найдена")
    void getCategoryById_notFound() {
        when(categoryRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> categoryService.getCategoryById(99L));
    }

    @Test
    @DisplayName("createCategory — успех")
    void createCategory_success() {
        CategoryRequest request = new CategoryRequest("Фантастика");

        Category savedCategory = new Category("Фантастика");
        savedCategory.setId(2L);

        CategoryDto savedDto = new CategoryDto(
                2L, "Фантастика",
                Collections.emptyList());

        when(categoryRepository.save(any(Category.class)))
                .thenReturn(savedCategory);
        when(categoryMapper.toDto(savedCategory))
                .thenReturn(savedDto);

        CategoryDto result =
                categoryService.createCategory(request);

        assertNotNull(result);
        assertEquals("Фантастика", result.name());
        verify(categoryRepository).save(any(Category.class));
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("updateCategory — успех")
    void updateCategory_success() {
        CategoryRequest request = new CategoryRequest("Детектив");

        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class)))
                .thenReturn(testCategory);
        when(categoryMapper.toDto(any(Category.class)))
                .thenReturn(new CategoryDto(
                        1L, "Детектив",
                        Collections.emptyList()));

        CategoryDto result =
                categoryService.updateCategory(1L, request);

        assertNotNull(result);
        assertEquals("Детектив", result.name());
        verify(bookCacheManager).invalidate();
    }

    @Test
    @DisplayName("updateCategory — не найдена")
    void updateCategory_notFound() {
        CategoryRequest request = new CategoryRequest("Детектив");

        when(categoryRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> categoryService.updateCategory(
                        99L, request));
    }

    @Test
    @DisplayName("deleteCategory — успех")
    void deleteCategory_success() {
        doNothing().when(categoryRepository).deleteById(1L);

        categoryService.deleteCategory(1L);

        verify(categoryRepository).deleteById(1L);
        verify(bookCacheManager).invalidate();
    }
}