package com.example.Minor_Project.exceptions;

public class TransactionException extends RuntimeException{   //if it was extending Exception,then whenever this exception comes, its corresponding method should throw the exception

    public TransactionException(String message) {
        super(message);
    }
}
