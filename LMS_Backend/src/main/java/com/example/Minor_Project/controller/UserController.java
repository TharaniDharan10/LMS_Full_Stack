package com.example.Minor_Project.controller;

import com.example.Minor_Project.dto.AddUserRequest;
import com.example.Minor_Project.model.User;
import com.example.Minor_Project.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping("/student")
    public ResponseEntity<User> addStudent(@RequestBody @Valid AddUserRequest addUserRequest){
        User addedUser = userService.addStudent(addUserRequest);
        return new ResponseEntity<>(addedUser, HttpStatus.CREATED);

    }

    @PostMapping("/admin")
    public ResponseEntity<User> addAdmin(@RequestBody @Valid AddUserRequest addUserRequest){
        User addedUser = userService.addAdmin(addUserRequest);
        return new ResponseEntity<>(addedUser, HttpStatus.CREATED);

    }

    @GetMapping("/me")
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return userService.fetchUserByEmail(user.getUsername());
    }
}
