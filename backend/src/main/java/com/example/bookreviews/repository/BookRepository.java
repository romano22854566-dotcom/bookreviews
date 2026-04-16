package com.example.bookreviews.repository;

import com.example.bookreviews.model.Book;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import com.example.bookreviews.dto.BookFilterResult;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    @NonNull
    @EntityGraph(attributePaths = {"authors", "comments", "categories"})
    List<Book> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = {"authors", "comments", "categories"})
    List<Book> findByTitleContainingIgnoreCase(String title);

    @NonNull
    @EntityGraph(attributePaths = {"authors", "comments", "categories"})
    Optional<Book> findWithDetailsById(Long id);

    @Query("SELECT DISTINCT b FROM Book b "
            + "LEFT JOIN FETCH b.authors "
            + "LEFT JOIN FETCH b.categories "
            + "LEFT JOIN FETCH b.comments "
            + "WHERE b.id IN ("
            + "  SELECT DISTINCT b2.id FROM Book b2 "
            + "  LEFT JOIN b2.authors a "
            + "  LEFT JOIN b2.categories c "
            + "  LEFT JOIN b2.comments cm "
            + "  WHERE (:authorLastName IS NULL "
            + "         OR a.lastName = :authorLastName) "
            + "  AND (:categoryName IS NULL "
            + "       OR c.name = :categoryName) "
            + "  AND (:rating IS NULL OR cm.rating = :rating)"
            + ") "
            + "ORDER BY b.id")
    List<Book> findBooksByFilterJpql(
            @Param("authorLastName") String authorLastName,
            @Param("categoryName") String categoryName,
            @Param("rating") Integer rating,
            Pageable pageable);

    @Query(value = "SELECT b.id as id, b.title as title, b.pages as pages, b.publication_year as publicationYear, "
            + "string_agg(DISTINCT a.first_name || ' ' || a.last_name, '|') as authorNames, "
            + "string_agg(DISTINCT c.name, '|') as categoryNames, "
            + "string_agg(DISTINCT '[' || cm.rating || '/10] ' || cm.text, '|') as commentTexts "
            + "FROM books b "
            + "LEFT JOIN book_author ba ON b.id = ba.book_id "
            + "LEFT JOIN authors a ON ba.author_id = a.id "
            + "LEFT JOIN book_category bc ON b.id = bc.book_id "
            + "LEFT JOIN categories c ON bc.category_id = c.id "
            + "LEFT JOIN comments cm ON b.id = cm.book_id "
            + "WHERE (:authorLastName IS NULL OR a.last_name = :authorLastName) "
            + "AND (CAST(:categoryName AS VARCHAR) IS NULL OR c.name = :categoryName) "
            + "AND (CAST(:rating AS INTEGER) IS NULL OR cm.rating = :rating) "
            + "GROUP BY b.id, b.title, b.pages, b.publication_year "
            + "ORDER BY b.id",
            nativeQuery = true)
    List<BookFilterResult> findBooksByFilterNativeReal(
            @Param("authorLastName") String authorLastName,
            @Param("categoryName") String categoryName,
            @Param("rating") Integer rating,
            Pageable pageable);
}