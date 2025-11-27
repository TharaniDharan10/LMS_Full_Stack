//package com.example.Minor_Project;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
//import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.data.redis.serializer.StringRedisSerializer;
//
//import java.util.ArrayList;
//
//@Configuration  //to create bean pf RedisTemplate
//public class RedisConfig {
//
//    @Value("${redis.host}")
//    String redisDataSource;
//
//    @Value("${redis.port}")
//    int redisDsPort;
//
//    @Value("${redis.password}")
//    String redisDsPassword;
//
//    @Bean
//    public LettuceConnectionFactory lettuceRedisConnectionFactory(){    //copy pasted this code from resources which i had
//        RedisStandaloneConfiguration redisStandaloneConfiguration =
//                new RedisStandaloneConfiguration(redisDataSource, redisDsPort);
//        redisStandaloneConfiguration.setPassword(redisDsPassword);
//        LettuceConnectionFactory lettuceRedisConnectionFactory= new
//                LettuceConnectionFactory(redisStandaloneConfiguration);
//        return lettuceRedisConnectionFactory;
//    }
//
//    @Bean
//    RedisTemplate<String,Object> redisTemplate(){
//        RedisTemplate<String,Object> redisTemplate = new RedisTemplate<>(); //here automatically its doing serialisation and deserialisation using defaultSerializer of RedisTemplate,but there are other options aswell like keySerializer, valuekeySerializer, hashkeykeySerializer, hashValuekeySerializer.
//        //What is serializer = which converts java object into actual byteArrayOutputStream
////        redisTemplate.setKeySerializer(new StringRedisSerializer());    //if i know my key will be string only,then i can do this. Here StringRedisSerializer implements RedisSerializer.Actually this line is not required,just to show i created this.
//        redisTemplate.setConnectionFactory(lettuceRedisConnectionFactory());
//        return redisTemplate;
//    }
//}
