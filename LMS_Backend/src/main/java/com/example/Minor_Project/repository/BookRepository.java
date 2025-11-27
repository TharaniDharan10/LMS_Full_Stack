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

    // This single query replaces the entire CustomBookRepositoryImpl file
    // It says: "If title is provided, match it. AND If type is provided, match it."
    @Query("SELECT b FROM Book b WHERE " +
            "(:title IS NULL OR LOWER(b.bookTitle) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:type IS NULL OR b.bookType = :type)")
    List<Book> findBookByFilters(@Param("title") String title, @Param("type") BookType type);


    // Add this line inside the interface
    long countByBookType(BookType bookType);
}
