package com.example.Minor_Project.mapper;


import com.example.Minor_Project.dto.AddBookRequest;
import com.example.Minor_Project.model.Author;
import lombok.experimental.UtilityClass;

@UtilityClass //this creates a private constructor for the class and makes all this class methods as static
public class AuthorMapper {

    public Author mapToAuthor (AddBookRequest addBookRequest){ //instead of this boiler plate,we can make use of mapstruct dependency also where we create an interface and while running the app,it has its own class to provide implementation
                return Author.builder()
                .name(addBookRequest.getAuthorName())
                .email(addBookRequest.getAuthorEmail())
                .build();
    }

}
