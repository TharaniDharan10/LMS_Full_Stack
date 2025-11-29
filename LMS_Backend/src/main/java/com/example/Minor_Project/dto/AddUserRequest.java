package com.example.Minor_Project.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddUserRequest {

    String userName;

    @NotBlank(message = "User email shouldnot be blank")
    @Email(message = "Please provide a valid email address")
    String email;

    // --- FIX: Updated Regex to allow Hyphens (-) ---
    // Old: "^\\+?[0-9]{10,15}$" (Failed on hyphen)
    // New: "^[+]?[0-9-]{10,20}$" (Allows +, numbers, and -)
    @NotBlank(message = "Phone number is mandatory")
    @Pattern(regexp = "^[+]?[0-9-]{10,20}$", message = "Invalid Phone Number. Format: +91-9876543210")
    String phoneNo;

    String address;

    // FIX: Strong Password Validation
    // Minimum 8 chars, at least 1 letter, 1 number, 1 special char
    @NotBlank(message = "Password cannot be blank")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$",
            message = "Password too weak. Must contain 8+ chars, 1 uppercase, 1 number, 1 special char.")
    String password;

    //i didnot add authorities here as authorities should be chosen at backend and not by us

}
