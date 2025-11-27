package com.example.Minor_Project; // Ensure package is controller

import com.example.Minor_Project.exceptions.TransactionException; // Import your custom exception
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // --- 1. Handle Custom Transaction Logic Errors (CRITICAL FOR FRONTEND) ---
    // Example: "Book is already issued", "User is blocked"
    @ExceptionHandler(TransactionException.class)
    public ResponseEntity<String> handleTransactionException(TransactionException ex) {
        // Return 400 Bad Request so the Frontend knows it's a logic error, not a server crash
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    // --- 2. Handle @Valid Validation Errors ---
    // Example: "Email cannot be blank"
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    // --- 3. Handle Database Constraints (Duplicate Emails/Users) ---
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = ex.getMessage();

        if (message != null && (message.contains("Duplicate entry") ||
                message.contains("unique constraint") ||
                message.contains("already exists"))) {

            if (message.contains("email") || message.contains("EMAIL")) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("A user with this email already exists.");
            } else if (message.contains("userName") || message.contains("USER_NAME")) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("A user with this username already exists.");
            } else if (message.contains("bookNo")) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("A book with this Number already exists.");
            }

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Duplicate entry detected. Please check your input.");
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Database error. Please check your input.");
    }

    // --- 4. Handle Illegal Arguments ---
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ex.getMessage());
    }

    // --- 5. Catch-All for Server Crashes ---
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        // Ideally log the full stack trace here for the developer
        ex.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An internal error occurred: " + ex.getMessage());
    }
}