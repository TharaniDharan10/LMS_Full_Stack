package com.example.Minor_Project.controller;

import com.example.Minor_Project.exceptions.TransactionException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.LinkedList;

@Slf4j
//Method 2 to handle exception thrown to frontend
@ControllerAdvice //this is class created and annotated with this bcoz when we look to issue a book which is already issued,it throws 500 Internal Server error and in frontend to show what is the issue we do this.
public class ControllerExceptionAdvice {

    @ExceptionHandler(value = TransactionException.class) //to make this code execution for a set of exception,use {} and put all the exception class altogether in it with "," in btn.
    public ResponseEntity<String> takeAction(TransactionException transactionException){//while throwing exception,map it to ResponseEntity
        log.error("transactionException occurred : {}",transactionException);
        return new ResponseEntity<>(transactionException.getMessage(), HttpStatus.BAD_REQUEST);

    }
}
