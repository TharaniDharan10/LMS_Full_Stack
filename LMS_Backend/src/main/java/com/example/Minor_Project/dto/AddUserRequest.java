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

    // regexp = "\\d+" means: Must contain one or more digits (0-9) only.
    // If you want to enforce a length (e.g., 10 digits), use "\\d{10}"
    @Pattern(regexp = "\\d+", message = "Phone number must contain only numbers")
    String phoneNo; //we didnot make this is @NotBlank as we have decided that even if user is not providing phoneNo,just with email he should register

    String address;

    @NotBlank(message = "User password shouldnot be blank")
    String password;

    //i didnot add authorities here as authorities should be chosen at backend and not by us

}
