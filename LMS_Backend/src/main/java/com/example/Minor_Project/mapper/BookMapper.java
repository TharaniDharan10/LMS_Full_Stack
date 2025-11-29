package com.example.Minor_Project.mapper;


import com.example.Minor_Project.dto.AddBookRequest;
import com.example.Minor_Project.model.Book;
import lombok.experimental.UtilityClass;

@UtilityClass
public class BookMapper {

    public Book mapToBook(AddBookRequest addBookRequest){
        return Book.builder()
                .bookNo(addBookRequest.getBookNo())
                .bookTitle(addBookRequest.getBookTitle())
                .summary(addBookRequest.getSummary())
                .imageUrl(addBookRequest.getImageUrl())
                .pdfUrl(addBookRequest.getPdfUrl())
                .bookType(addBookRequest.getBookType())
                .securityAmount(addBookRequest.getSecurityAmount())
                .build();

    }
}
