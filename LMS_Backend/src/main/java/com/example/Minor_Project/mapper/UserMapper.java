package com.example.Minor_Project.mapper;

import com.example.Minor_Project.dto.AddUserRequest;
import com.example.Minor_Project.enums.UserStatus;
import com.example.Minor_Project.model.User;
import lombok.experimental.UtilityClass;

@UtilityClass
public class UserMapper {

    public User mapToUser(AddUserRequest UserRequest){
        return User.builder()
                .phoneNo(UserRequest.getPhoneNo())
                .name(UserRequest.getUserName())
                .email(UserRequest.getEmail())
                .address(UserRequest.getAddress())
                .password(UserRequest.getPassword())    //added after learning Spring Security
                .userStatus(UserStatus.ACTIVE)
                .build();
    }
}
