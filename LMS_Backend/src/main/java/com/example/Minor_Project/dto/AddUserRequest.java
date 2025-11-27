package com.example.Minor_Project.dto;

import jakarta.validation.constraints.NotBlank;
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
    String email;

    String phoneNo; //we didnot make this is @NotBlank as we have decided that even if user is not providing phoneNo,just with email he should register

    String address;

    @NotBlank(message = "User password shouldnot be blank")
    String password;

    //i didnot add authorities here as authorities should be chosen at backend and not by us

}
