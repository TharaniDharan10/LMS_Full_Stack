package com.example.Minor_Project.controller;


import com.example.Minor_Project.annotations.LogAnnotation;
import com.example.Minor_Project.dto.AddBookRequest;
import com.example.Minor_Project.enums.BookType;
import com.example.Minor_Project.model.Book;
import com.example.Minor_Project.repository.BookRepository;
import com.example.Minor_Project.service.BookService;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/book")
public class BookController {

    @Autowired
    BookService bookService;

    @PostMapping
    public ResponseEntity<Book> addBook(@RequestBody  @Valid AddBookRequest bookRequest){    //actually we shouldnot be doing this as sending book's response entity will also send its book id to frontend/client.Since we have made @Valid,for whatever field it is applied for AddBookRequest,if even one field is not given an input or missed out in postman,then it throws 400 error code
//        AddBookRequest bookRequest1 = AddBookRequest.builder().bookNo("123").build();//this is where builder is used
//        if(StringUtils.isEmpty(bookRequest.getBookNo())){
//            //throw some exception      //in organisation,this is not recommanded as there are 6 to 7 fields in AddBookRequest and we have to write for all.so they add a dependency called validation and we annotate fields in AddBookRequest with @positive @NotBlank and @NotNull for enumerations as enums produce instance of their values
//        }


        Book savedBook = bookService.addBook(bookRequest);
        return new ResponseEntity<>(savedBook, HttpStatus.CREATED);
    }


    @GetMapping("/all") //criteria query is created when we want to filter search for various types //whenever we are creating our own queries,we have to directly interact with EntityManager,we cannot directly use the JpaRepository,so we need to autowire this in some class,so we created CustomBookRepository and its implementing class CustomBookRepositoryImpl which is extended by BookRepository
    @LogAnnotation  //custom annotation
    public ResponseEntity<List<Book>> getBooks(@RequestParam(value = "title" , required = false) String bookTitle , @RequestParam(value = "type" , required = false) String bookType){

        log.info("In bookController and in getBooks method");
        List<Book> books = bookService.getBooks(bookTitle,bookType);
        return new ResponseEntity<>(books, HttpStatus.OK);

    }

    @DeleteMapping("/{bookNo}")
    public ResponseEntity<String> deleteBook(@PathVariable String bookNo) {
        try {
            bookService.deleteBook(bookNo);
            return new ResponseEntity<>("Book deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            // This catches Foreign Key errors (e.g., if book has transaction history)
            return new ResponseEntity<>("Cannot delete: Book is issued or has history.", HttpStatus.BAD_REQUEST);
        }
    }
}
