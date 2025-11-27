package com.example.Minor_Project.repository;

import com.example.Minor_Project.model.Author;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RedisDataRepository {

    @Autowired
    RedisTemplate redisTemplate;    //this instance bean was  created by us in RedisConfig

    private String AUTHOR_KEY = "author:";

    public void saveAuthorToRedis(Author author){
        redisTemplate.opsForValue().set(AUTHOR_KEY.concat(author.getEmail()),author);   //Key: AUTHOR_KEY.concat(author.getEmail())  , Value : author
    }

    public Author getAuthorByEmail(String email){
        return (Author) redisTemplate.opsForValue().get(AUTHOR_KEY.concat(email));   //since get returns a type Object, we downcast it to author
    }
}
