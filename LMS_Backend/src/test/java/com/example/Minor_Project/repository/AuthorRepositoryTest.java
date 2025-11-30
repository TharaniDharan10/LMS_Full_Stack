//package com.example.Minor_Project.repository;
//
//import com.example.Minor_Project.model.Author;
//import org.junit.jupiter.api.Assertions;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.autoconfigure.domain.EntityScan;
//import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
//import org.springframework.context.annotation.ComponentScan;
//
//@DataJpaTest
//@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2, replace = AutoConfigureTestDatabase.Replace.ANY) // Ensures H2 is used
//@EntityScan(basePackages = "com.example.Minor_Project.model") // <--- CRITICAL FIX: Finds Author.java
//public class AuthorRepositoryTest {
//
//    @Autowired
//    AuthorRepository authorRepository;
//
//    @BeforeEach
//    public void setup(){ //here also id is auto generated,so dont try t work with id,thats why i used name here
//        Author author = Author.builder().name("yukta").email("abc@gmail.com").build();
//        authorRepository.save(author);
//    }
//
//    @Test
//    public void fetchAuthorByEmailByNativeQuery_ValidAuthor_ReturnsData(){
//        Author returnedAuthor = authorRepository.fetchAuthorByEmailByNativeQuery("abc@gmail.com");
//        Assertions.assertEquals("yukta",returnedAuthor.getName());
//    }
//
//    @Test
//    public void fetchAuthorByEmailByNativeQuery_InvalidAuthor_ReturnsNull(){
//
//        Assertions.assertNull(authorRepository.fetchAuthorByEmailByNativeQuery("def@gmail.com"));
//    }
//
//
//}

package com.example.Minor_Project.repository;

import com.example.Minor_Project.model.Author;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

// The critical fix is adding these properties directly to the test class:
@DataJpaTest
// Set 'replace' to NONE to prevent Spring from ignoring the config file.
// It should now use the URL from src/test/resources/application.properties.
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EntityScan(basePackages = "com.example.Minor_Project.model")

public class AuthorRepositoryTest {

    @Autowired
    AuthorRepository authorRepository;

    @Autowired
    TestEntityManager entityManager;

    // --- Note: Ensure your AuthorRepository has the correct @Query: SELECT * FROM Author ---

    @Test
    public void fetchAuthorByEmailByNativeQuery_ValidAuthor_ReturnsData(){

        Author author = entityManager.persistAndFlush(
                Author.builder().name("yukta").email("abc@gmail.com").build()
        );

        Author returnedAuthor = authorRepository.fetchAuthorByEmailByNativeQuery("abc@gmail.com");

        Assertions.assertEquals("yukta", returnedAuthor.getName());
    }

    @Test
    public void fetchAuthorByEmailByNativeQuery_InvalidAuthor_ReturnsNull(){
        // This implicitly relies on the schema being created correctly
        Assertions.assertNull(authorRepository.fetchAuthorByEmailByNativeQuery("def@gmail.com"));
    }
}