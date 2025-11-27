package com.example.Minor_Project.repository;

import com.example.Minor_Project.model.Author;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
public class AuthorRepositoryTest {

    @Autowired
    AuthorRepository authorRepository;

    @BeforeEach
    public void setup(){ //here also id is auto generated,so dont try t work with id,thats why i used name here
        Author author = Author.builder().name("yukta").email("abc@gmail.com").build();
        authorRepository.save(author);
    }

    @Test
    public void fetchAuthorByEmailByNativeQuery_ValidAuthor_ReturnsData(){
        Author returnedAuthor = authorRepository.fetchAuthorByEmailByNativeQuery("abc@gmail.com");
        Assertions.assertEquals("yukta",returnedAuthor.getName());
    }

    @Test
    public void fetchAuthorByEmailByNativeQuery_InvalidAuthor_ReturnsNull(){

        Assertions.assertNull(authorRepository.fetchAuthorByEmailByNativeQuery("def@gmail.com"));
    }


}
