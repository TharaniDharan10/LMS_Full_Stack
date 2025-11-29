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

import java.util.UUID; // --- ADDED MISSING IMPORT ---

@Service
public class UserService implements UserDetailsService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    NotificationService notificationService;

    // --- 1. STUDENT REGISTRATION (With Verification) ---
    public User addStudent(AddUserRequest addUserRequest) {
        User user = UserMapper.mapToUser(addUserRequest);
        user.setUserType(UserType.STUDENT);
        user.setAuthorities("STUDENT");

        // --- VERIFICATION LOGIC ---
        user.setVerified(false); // Block login until verified
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);

        User savedUser = userRepository.save(user);

        // Send Verification Link via Email
        // Ensure your AuthController has a mapping for /auth/verify
        String link = "http://localhost:8081/auth/verify?token=" + token;
        try {
            notificationService.sendEmail(user.getEmail(), "Verify Account - LMS",
                    "Welcome to LMS! Please click the link to verify your account: " + link);
        } catch (Exception e) {
            System.out.println("Failed to send verification email: " + e.getMessage());
        }

        return savedUser;
    }

    // --- 2. VERIFY USER (Called when link is clicked) ---
    public boolean verifyUser(String token) {
        User user = userRepository.findByVerificationToken(token);
        if (user == null) return false;

        user.setVerified(true);
        user.setVerificationToken(null); // Invalidate token after use
        userRepository.save(user);
        return true;
    }

    public User fetchUserByEmail(String email){
        return userRepository.findByEmail(email);
    }

    // --- 3. LOGIN LOGIC (Now checks verification status) ---
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("=== AUTHENTICATING USER: " + username + " ===");

        User user = userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("User does not exist");
        }

        // --- CRITICAL: BLOCK UNVERIFIED USERS ---
        if (!user.isVerified()) {
            System.out.println("✗ User found but NOT verified.");
            throw new UsernameNotFoundException("Email not verified. Please check your inbox.");
        }

        return user;
    }

    // --- 4. ADMIN REGISTRATION ---
    public User addAdmin(@Valid AddUserRequest addUserRequest){
        User user = UserMapper.mapToUser(addUserRequest);
        user.setUserType(UserType.ADMIN);
        user.setAuthorities("ADMIN");

        // Admins created via Dashboard are auto-verified so they can login immediately
        user.setVerified(true);

        User savedUser = userRepository.save(user);

        if(savedUser.getEmail() != null) {
            try {
                notificationService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getName());
            } catch (Exception e) {
                System.out.println("Failed to send welcome email: " + e.getMessage());
            }
        }
        return savedUser;
    }

    // --- 5. PROFILE UPDATE ---
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

    // --- 6. FORGOT PASSWORD LOGIC ---
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return "User not found";
        }

        // Generate Reset Token
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token); // Reusing this field for reset logic
        userRepository.save(user);

        // Send Email
        // NOTE: You need a frontend route for /reset-password
        String link = "http://localhost:3000/reset-password?token=" + token;
        try {
            notificationService.sendEmail(user.getEmail(), "Reset Password - LMS",
                    "Click here to reset your password: " + link);
            return "Reset link sent to your email";
        } catch (Exception e) {
            return "Failed to send email";
        }
    }


    public String resetPassword(String token, String newPassword) {
        User user = userRepository.findByVerificationToken(token);
        if (user == null) {
            return "Invalid or Expired Token";
        }

        // Update password
        user.setPassword(newPassword);
        // Clear token so it cannot be used again
        user.setVerificationToken(null);

        userRepository.save(user);

        return "Password reset successfully";
    }
}