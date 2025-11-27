package com.example.Minor_Project.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionRequest {

    @NotBlank(message = "Book no is mandatory")
    String bookNo;

    @NotBlank(message = "User Email is mandatory")
    String userEmail;

    String paymentId;

}
