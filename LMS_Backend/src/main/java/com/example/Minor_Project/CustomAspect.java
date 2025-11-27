package com.example.Minor_Project;

import com.example.Minor_Project.model.Book;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

import java.util.List;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class CustomAspect {

    @Before("execution(* com.example.Minor_Project.controller.BookController.getBooks(..))")
    public void emitbeforelogs(JoinPoint joinPoint){
        log.info("I am in emit logs before : "+joinPoint.getSignature());
    }

    @After("execution(* com.example.Minor_Project.controller.BookController.getBooks(..))")
    public void emitafterlogs(JoinPoint joinPoint){
        log.info("I am in emit logs after : "+joinPoint.getSignature());
    }


    @Around("execution(* com.example.Minor_Project.service.BookService.getBooks(..))")  //around is used whenever we will be invoking the method,and will not be invoked automatically
    public Object emitlogs(ProceedingJoinPoint  proceedingJoinPoint) throws Throwable {
        log.info("I am in emit logs before : "+proceedingJoinPoint.getSignature()); //this is before logic
        Object response = proceedingJoinPoint.proceed();    //we use Object as we dont know what s been returned by the method    // After above line,this line is processed.
        // From here it goes back to its pointcut.executes its function,and after completing all methods in it,
        // the flow comes back here and executes the next lines

//        List<Book> res= (java.util.List<Book>)response;
        log.info("Response : {}",response);
        log.info("I am in emit logs after : "+proceedingJoinPoint.getSignature());  //this is after logic
        return response;
    }

    @Around("@annotation(com.example.Minor_Project.annotations.LogAnnotation)")
    public Object emitLogUsingAnnotation(ProceedingJoinPoint  proceedingJoinPoint) throws Throwable {
        log.info("I am around annotation in emit logs before : "+proceedingJoinPoint.getSignature()); //this is before logic
        Object response = proceedingJoinPoint.proceed();    //we use Object as we dont know what s been returned by the method    // After above line,this line is processed.
        // From here it goes back to its pointcut.executes its function,and after completing all methods in it,
        // the flow comes back here and executes the next lines

//        List<Book> res= (java.util.List<Book>)response;
        log.info("Response : {}",response);
        log.info("I am around annotation in emit logs after : "+proceedingJoinPoint.getSignature());  //this is after logic
        return response;
    }


}
