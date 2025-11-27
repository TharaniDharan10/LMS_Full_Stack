package com.example.Minor_Project.service;

import com.example.Minor_Project.dto.TransactionRequest;
import com.example.Minor_Project.enums.UserType;
import com.example.Minor_Project.exceptions.TransactionException;
import com.example.Minor_Project.model.Transaction;
import com.example.Minor_Project.model.User;
import com.example.Minor_Project.repository.TransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.util.ReflectionTestUtils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Slf4j
@ExtendWith(MockitoExtension.class)
public class TransactionServiceTest {

    @Mock   //this is used to create mocked object so that when a method is tested and that method had invoking submethods from other class, in that case we include those class here
    UserService userService;

    @Mock
    BookService bookService;

    @Mock
    TransactionRepository transactionRepository;

    @InjectMocks    //injects created mocks into this class
    TransactionService transactionService;

//    @Test
//    public void calculateFine_WithinValidDays_ReturnsCorrectAmount(){
//        TransactionService transactionService = new TransactionService();
//        ReflectionTestUtils.setField(transactionService,"validDays" , 14);  //this is used to set value for test for private attributes of a testing class method
//        ReflectionTestUtils.setField(transactionService,"finePerDay" , 1);
//
//        Transaction transaction = Transaction.builder()
//                .createdOn(new Date()).settlementAmount(-200).build();
//
//        int amount = transactionService.calculateFine(transaction);
//
//        Assertions.assertEquals(-200,amount);
//
////        Assertions.assertNull(amount);
////        Assertions.assertThrows(TransactionException.class,()-> transactionService.calculateFine(transaction));
//
//    }
//
//    @Test
//    public void calculateFine_InValidDays_ReturnsCorrectAmount() throws ParseException {
//        TransactionService transactionService = new TransactionService();
//        ReflectionTestUtils.setField(transactionService,"validDays" , 14);  //this is used to set value for test for private attributes of a testing class method
//        ReflectionTestUtils.setField(transactionService,"finePerDay" , 1);
//
//        Date date = new SimpleDateFormat("yyyy-MM-dd").parse("2024-01-01");
//        Transaction transaction = Transaction.builder().createdOn(date).settlementAmount(-200).build();
//
//        int amount = transactionService.calculateFine(transaction);
//        Assertions.assertEquals(-178,amount);   //expected -178 as i did this check on 27th Jan 2025
//
//    }

    //Above code is perfectly correct.Just commented to show workflow of @BeforeEach


    @BeforeEach //gets executed before each time a method from this class is called
    public void setUp(){
        System.out.println("From test");
        log.info("Log from BeforeEach");
//        transactionService = new TransactionService();    //commented this as i used injectMocks on this TransactionService class
        ReflectionTestUtils.setField(transactionService,"validDays" , 14);  //this is used to set value for test for private attributes of a testing class method
        ReflectionTestUtils.setField(transactionService,"finePerDay" , 1);

    }

    @BeforeAll   //gets executed only ones for the entire class.Only annotated over a static method
    public static void abc(){
        log.info("Log from BeforeAll");
    }

    @Test
    public void calculateFine_WithinValidDays_ReturnsCorrectAmount(){

        Transaction transaction = Transaction.builder()
                .createdOn(new Date()).settlementAmount(-200).build();

        int amount = transactionService.calculateFine(transaction);

        Assertions.assertEquals(-200,amount);

//        Assertions.assertNull(amount);
//        Assertions.assertThrows(TransactionException.class,()-> transactionService.calculateFine(transaction));

    }

    @Test
    public void calculateFine_InValidDays_ReturnsCorrectAmount() throws ParseException {

        Date date = new SimpleDateFormat("yyyy-MM-dd").parse("2024-01-01");
        Transaction transaction = Transaction.builder().createdOn(date).settlementAmount(-200).build();

        int amount = transactionService.calculateFine(transaction);
        Assertions.assertEquals(179,amount);   //expected -178 as i did this check on 27th Jan 2025

    }


//    @Test
//    public void fetchUser_ValidStudent_ReturnsCorrectStudent(){
//        User user = User.builder().id(123).build();
//        Mockito.when(userService.fetchUserByEmail("abc@gmail.com")).thenReturn(user); //when it has got to return something ,use thenReturn
//
////        Mockito.when(userService.fetchUserByEmail("abc@gmail.com")).thenThrow(new RuntimeException());//when it has got to throw something ,use thenThrow
////
////        Mockito.doThrow(new RuntimeException()).when(userService).abc(); //when it has got nothing to return ,use do
//
//        //so by mocking, instead of actually going into userService, we create a mocked userService
//        TransactionRequest transactionRequest = TransactionRequest.builder().userEmail("abc@gmail.com").build();
//        transactionService.fetchUser(transactionRequest);
//    }

    @Test
    public void fetchUser_InvalidStudent_ThrowsException(){
        User user = User.builder().id(123).userType(UserType.ADMIN).build();
        //the scope of this mock is only for this method,thats why we were able to use same for next method also
        Mockito.when(userService.fetchUserByEmail("abc@gmail.com")).thenReturn(user); //when it has got to return something ,use thenReturn
        TransactionRequest transactionRequest = TransactionRequest.builder().userEmail("abc@gmail.com").build();
        Assertions.assertThrows(TransactionException.class,()->transactionService.fetchUser(transactionRequest));
        transactionService.fetchUser(transactionRequest);
    }

    @Test
    public void fetchUser_ValidStudent_ReturnsCorrectStudent(){
        User user = User.builder().id(123).userType(UserType.STUDENT).build();
        Mockito.when(userService.fetchUserByEmail("abc@gmail.com")).thenReturn(user); //when it has got to return something ,use thenReturn
        TransactionRequest transactionRequest = TransactionRequest.builder().userEmail("abc@gmail.com").build();
        User returnedUser = transactionService.fetchUser(transactionRequest);
        Assertions.assertEquals(user,returnedUser);
    }
}
