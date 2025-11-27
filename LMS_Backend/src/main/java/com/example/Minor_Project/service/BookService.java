package com.example.Minor_Project.service;

import com.example.Minor_Project.dto.AddBookRequest;
import com.example.Minor_Project.enums.BookType;
import com.example.Minor_Project.mapper.AuthorMapper;
import com.example.Minor_Project.mapper.BookMapper;
import com.example.Minor_Project.model.Author;
import com.example.Minor_Project.model.Book;
import com.example.Minor_Project.repository.BookRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class BookService {

    @Autowired
    AuthorService authorService;

    @Autowired
    BookRepository bookRepository;


    public Book addBook(AddBookRequest bookRequest) {
        Author authorFromDB = authorService.getAuthorByEmail(bookRequest.getAuthorEmail());
        if(authorFromDB == null){
            authorFromDB = AuthorMapper.mapToAuthor(bookRequest);
            authorFromDB = authorService.addAuthor(authorFromDB);

        }

        Book book = BookMapper.mapToBook(bookRequest);
        book.setAuthor(authorFromDB);

        // This ensures that 'authorFromDB' knows about the new book immediately preventing "books: null" when you fetch the author right after.
        List<Book> currentBooks = authorFromDB.getBooks();
        if(currentBooks == null) {
            currentBooks = new ArrayList<>();
        }
        currentBooks.add(book);
        authorFromDB.setBooks(currentBooks);

        return bookRepository.save(book);


    }

    public void updateBookMetaData(Book book){
        bookRepository.save(book);
    }

    public Book getBookByBookNo(String bookNo) {
        return bookRepository.findBookByBookNo(bookNo);
    }

    // --- UPDATED: Accepts Author and Status for Advanced Search ---
    public List<Book> getBooks(String bookTitle, String bookType, String author, String status) {

        log.info("I am in bookService. Searching for Title: {}, Type: {}, Author: {}, Status: {}", bookTitle, bookType, author, status);

        // 1. Convert String to Enum (BookType)
        BookType type = null;
        if (bookType != null && !bookType.trim().isEmpty()) {
            try {
                type = BookType.valueOf(bookType);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid book type passed: " + bookType);
            }
        }

        // 2. Convert String to Boolean (Issued Status)
        // Logic: "ISSUED" = true, "AVAILABLE" = false, Empty/Null = null (ignore filter)
        Boolean isIssued = null;
        if (status != null && !status.trim().isEmpty()) {
            if ("ISSUED".equalsIgnoreCase(status)) {
                isIssued = true;
            } else if ("AVAILABLE".equalsIgnoreCase(status)) {
                isIssued = false;
            }
        }

        // 3. Call Repository with all 4 filters
        List<Book> res = bookRepository.findBookByFilters(bookTitle, type, author, isIssued);

        log.info("I am returning from bookService with {} books found", res.size());
        return res;
    }

    public void deleteBook(String bookNo) {
        Book book = bookRepository.findBookByBookNo(bookNo);
        if (book != null) {
            bookRepository.delete(book);
        } else {
            throw new RuntimeException("Book not found");
        }
    }



}

