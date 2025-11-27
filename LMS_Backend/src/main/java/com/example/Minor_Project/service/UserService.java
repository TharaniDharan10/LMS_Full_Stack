//package com.example.Minor_Project.service;
//
//import com.example.Minor_Project.dto.AddUserRequest;
//import com.example.Minor_Project.enums.UserType;
//import com.example.Minor_Project.mapper.UserMapper;
//import com.example.Minor_Project.model.User;
//import com.example.Minor_Project.repository.UserRepository;
//import jakarta.validation.Valid;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//@Service
//public class UserService implements UserDetailsService {    //cause UserService is Service of POJO class User, which is implementing UserDetails
//
//    @Autowired
//    UserRepository userRepository;
//
//
//    public User addStudent(AddUserRequest addUserRequest) {
//        User user = UserMapper.mapToUser(addUserRequest);
//        user.setUserType(UserType.STUDENT);
//        user.setAuthorities("STUDENT"); //added after learning Spring Security
//
//        return userRepository.save(user);
//    }
//
//
//    public User fetchUserByEmail(String email){
//       return userRepository.findByEmail(email);
//    }
//
////    public User addAdmin(AddUserRequest addUserRequest) {
////        User user = UserMapper.mapToUser(addUserRequest);
////        user.setUserType(UserType.ADMIN);
////    }
//
//    public void abc(){
//
//    }
//
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {   //unique identifier
//        User user = userRepository.findByEmail(username);
//
//        if(user != null){
//            return user;
//
//        }
//        throw new UsernameNotFoundException(username.concat(" doesnot exist")); //thrown when username is not found in DB
//
//    }
//
//    public User addAdmin(@Valid AddUserRequest addUserRequest){
//        User user = UserMapper.mapToUser(addUserRequest);
//        user.setUserType(UserType.ADMIN);
//        user.setAuthorities("ADMIN");   //if i want ADMIN to have authorities of STUDENT also,i can simply do user.setAuthorities("ADMIN,STUDENT");
//
//        return userRepository.save(user);
//    }
//}



package com.example.Minor_Project.service;

import com.example.Minor_Project.dto.AddUserRequest;
import com.example.Minor_Project.dto.UserUpdateRequest;
import com.example.Minor_Project.enums.UserType;
import com.example.Minor_Project.mapper.UserMapper;
import com.example.Minor_Project.model.User;
import com.example.Minor_Project.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    NotificationService notificationService;

    public User addStudent(AddUserRequest addUserRequest) {
        User user = UserMapper.mapToUser(addUserRequest);
        user.setUserType(UserType.STUDENT);
        user.setAuthorities("STUDENT");

        User saveduser =  userRepository.save(user);

        // This runs immediately after the user is saved to DB
        if(saveduser.getEmail() != null) {
            try {
                notificationService.sendWelcomeEmail(saveduser.getEmail(), saveduser.getName());
            } catch (Exception e) {
                System.out.println("Failed to send welcome email: " + e.getMessage());
            }
        }

        return saveduser;

    }

    public User fetchUserByEmail(String email){
        return userRepository.findByEmail(email);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("========================================");
        System.out.println("=== LOADING USER FOR AUTHENTICATION ===");
        System.out.println("========================================");
        System.out.println("Searching for user with identifier: " + username);

        User user = userRepository.findByEmail(username);

        if (user != null) {
            System.out.println("✓ USER FOUND!");
            System.out.println("  - Email: " + user.getEmail());
            System.out.println("  - Name: " + user.getName());
            System.out.println("  - Password in DB: " + user.getPassword());
            System.out.println("  - User Type: " + user.getUserType());
            System.out.println("  - Authorities: " + user.getAuthorities());
            System.out.println("  - Account Status: " + user.getUserStatus());
            System.out.println("========================================");
            return user;
        }

        System.out.println("✗ USER NOT FOUND!");
        System.out.println("  - Searched email: " + username);
        System.out.println("  - Total users in DB: " + userRepository.count());
        System.out.println("========================================");
        throw new UsernameNotFoundException(username + " does not exist");
    }

    public User addAdmin(@Valid AddUserRequest addUserRequest){
        User user = UserMapper.mapToUser(addUserRequest);
        user.setUserType(UserType.ADMIN);
        user.setAuthorities("ADMIN");

        User savedUser = userRepository.save(user);

        // --- 3. SEND WELCOME EMAIL FOR ADMIN TOO ---
        if(savedUser.getEmail() != null) {
            try {
                notificationService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getName());
            } catch (Exception e) {
                System.out.println("Failed to send welcome email: " + e.getMessage());
            }
        }
        return savedUser;
    }

    public User updateUserProfile(String email, UserUpdateRequest request) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            if(request.getName() != null && !request.getName().isEmpty()) user.setName(request.getName());
            if(request.getPhoneNo() != null && !request.getPhoneNo().isEmpty()) user.setPhoneNo(request.getPhoneNo());
            if(request.getAddress() != null && !request.getAddress().isEmpty()) user.setAddress(request.getAddress());
            return userRepository.save(user);
        }
        return null;
    }
}