package com.example.Minor_Project.controller;

import com.example.Minor_Project.model.Author;
import com.example.Minor_Project.service.AuthorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/author")
public class AuthorController {

    private static final Logger log = LoggerFactory.getLogger(AuthorController.class);
    @Autowired
    AuthorService authorService;

    @GetMapping()
    public ResponseEntity<Author> getAuthor(@RequestParam("email") String email){
//        long startTime = System.currentTimeMillis();
        Author author = authorService.getAuthorByEmail(email);
//        long endTime = System.currentTimeMillis();
//        log.info("Time : {}",(endTime-startTime));
        return new ResponseEntity<>(author, HttpStatus.CREATED);
    }

}


