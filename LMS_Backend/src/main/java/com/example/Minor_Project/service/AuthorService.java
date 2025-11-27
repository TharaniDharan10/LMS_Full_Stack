package com.example.Minor_Project.service;

import com.example.Minor_Project.model.Author;
import com.example.Minor_Project.repository.AuthorRepository;
import com.example.Minor_Project.repository.RedisDataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthorService {
    @Autowired
    AuthorRepository authorRepository;

    @Autowired
    RedisDataRepository redisDataRepository;

    public Author getAuthorByEmail(String email){
//        Author author = redisDataRepository.getAuthorByEmail(email);
//        if(author!=null){   //if author is saved in redis,fetch from redis only
//            log.info("Author found from redis");
//            return author;
//        }

        Author author = authorRepository.fetchAuthorByEmailByNativeQuery(email);

        if(author!=null){   //if author is not saved in redis,then fetch it from DB,save it in redis and return the author
            log.info("Author found from table");
            redisDataRepository.saveAuthorToRedis(author);
            log.info("Author saved in redis");
        }

        return author;

    }

    public Author addAuthor(Author author){
        Author savedAuthor = authorRepository.save(author); //saving in author table
//        redisDataRepository.saveAuthorToRedis(savedAuthor); //saving in redis so that fetching of author by email is possible with redis itself
//        log.info("Author saved in redis while adding author");
        return savedAuthor;
    }

}
