package com.example.Minor_Project.dto;


import com.example.Minor_Project.enums.BookType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.Map;

@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddBookRequest {

//inorder to run these validations,we have to add @Valid in BookController
    @NotBlank(message = "Book title shouldnot be blank")
    String bookTitle;

    @NotBlank(message = "Book No shouldnot be blank")
    String bookNo;

    @Positive(message = "SecurityAmount shouldnot be negative")
    int securityAmount;

    String summary;

    @NotNull(message = "Book title shouldnot be blank")   //since BookType is an enum
    BookType bookType;

    private String imageUrl;

    private String pdfUrl;

    @NotBlank(message = "Author name shouldnot be blank")
    String authorName;

    @NotBlank(message = "Author email shouldnot be blank")
    String authorEmail;




}


