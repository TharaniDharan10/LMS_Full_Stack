package com.example.Minor_Project.controller;

import com.example.Minor_Project.model.Author;
import com.example.Minor_Project.service.AuthorService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Stack;

import static org.mockito.ArgumentMatchers.any;


@ExtendWith(MockitoExtension.class)
public class AuthorControllerTest {

    @Mock
    AuthorService authorService;

    @InjectMocks
    AuthorController authorController;
    @Test
    public void getAuthor_ValidAuthor_returnsData(){
        Author author = Author.builder().id(1).build();
        Mockito.when(authorService.getAuthorByEmail(any())).thenReturn(author); //any() means when it gets anything ,do what i created
        ResponseEntity<Author> response = authorController.getAuthor("abc@gmail.com");
        Assertions.assertEquals(author , response.getBody());
    }

}
