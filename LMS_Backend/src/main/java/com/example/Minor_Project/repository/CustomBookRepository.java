//package com.example.Minor_Project.repository;
//
//import com.example.Minor_Project.enums.BookType;
//import com.example.Minor_Project.model.Book;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface CustomBookRepository { //its implemented by CustomBookRepositoryImpl class
//    //This interface was made to do Criteria Query i.e to do filter search for book.
//    // This could have been autowired into BookService itself, but since BookService has already
//    // some Repository which implements a JPARepository i.e BookRepository,
//    // we are creating this interface her separately
//
//    List<Book> findBookByFilters(String bookTitle , BookType bookType);
//}
