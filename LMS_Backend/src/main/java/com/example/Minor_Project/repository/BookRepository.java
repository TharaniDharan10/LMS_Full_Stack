package com.example.Minor_Project.repository;

import com.example.Minor_Project.enums.BookType;
import com.example.Minor_Project.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
//public interface BookRepository extends JpaRepository<Book,Integer> ,CustomBookRepository {
public interface BookRepository extends JpaRepository<Book,Integer>  {

    Book findBookByBookNo(String bookNo);

    // --- UPDATED QUERY FOR ADVANCED SEARCH ---
    // 1. Title (Partial)
    // 2. Type (Exact)
    // 3. Author (Partial match on joined table)
    // 4. Availability (Boolean: true = issued, false = available)
    @Query("SELECT b FROM Book b WHERE " +
            "(:title IS NULL OR LOWER(b.bookTitle) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:type IS NULL OR b.bookType = :type) AND " +
            "(:author IS NULL OR LOWER(b.author.name) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
            "(:issued IS NULL OR " +
            "  (:issued = true AND b.user IS NOT NULL) OR " +
            "  (:issued = false AND b.user IS NULL))")
    List<Book> findBookByFilters(
            @Param("title") String title,
            @Param("type") BookType type,
            @Param("author") String author,
            @Param("issued") Boolean issued
    );

    // Add this line inside the interface
    long countByBookType(BookType bookType);
}
