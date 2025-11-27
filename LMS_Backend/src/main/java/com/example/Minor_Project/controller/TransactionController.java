package com.example.Minor_Project.controller;

import com.example.Minor_Project.dto.TransactionRequest;
import com.example.Minor_Project.exceptions.TransactionException;
import com.example.Minor_Project.model.Transaction;
import com.example.Minor_Project.model.User;
import com.example.Minor_Project.service.TransactionService;
import com.example.Minor_Project.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transaction")
public class TransactionController {

    @Autowired
    TransactionService transactionService;

    @Autowired
    UserService userService;

    @PostMapping("/issue")
    public ResponseEntity<?> issueBook(@RequestBody @Valid TransactionRequest request){
//        Transaction  createdTransaction = null;
//
//        //Method 1 to handle exception thrown to frontend
//        try{  //we put this in try catch bcoz when we look to issue a book which is already issued,it throws 500 Internal Server error and in frontend to show what is the issue we do this.
//            createdTransaction = transactionService.issueBook(request);
//        }catch(TransactionException transactionException){
//            return new ResponseEntity<>(transactionException.getMessage(),HttpStatus.BAD_REQUEST);
//        }
//        return new ResponseEntity<>(createdTransaction, HttpStatus.OK);

        //fetch user details from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // --- MODIFICATION: Fetch the user safely from DB using the email/username from token
        // This 'initiator' could be a Student (issuing to self) or Admin (issuing to student)
        User initiator = userService.fetchUserByEmail(authentication.getName());

        // --- MODIFICATION: We removed the check `if(!user.getEmail().equals(request.getUserEmail()))` here.
        // We moved it to Service layer so we can allow ADMINs to bypass it.

        Transaction createdTransaction = transactionService.issueBook(initiator, request);
        return new ResponseEntity<>(createdTransaction, HttpStatus.OK);
    }

    @PutMapping("/return")
    public ResponseEntity<Integer> returnBook(@RequestBody @Valid TransactionRequest transactionRequest){ //returns settlement_Amount

        // --- MODIFICATION: Fetch the logged-in user (initiator) to pass to service
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User initiator = userService.fetchUserByEmail(authentication.getName());

        Integer settlementAmount = transactionService.returnBook(initiator, transactionRequest);
        return new ResponseEntity<>(settlementAmount, HttpStatus.OK);
    }

    @GetMapping("/history")
    public List<Transaction> getHistory() {
        // Get currently logged-in user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.fetchUserByEmail(authentication.getName());

        return transactionService.getTransactionHistory(user);
    }
}