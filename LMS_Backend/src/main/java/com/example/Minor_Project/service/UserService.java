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
import org.springframework.security.crypto.password.PasswordEncoder; // <--- Import this
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.DisabledException;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    NotificationService notificationService;

    @Autowired
    PasswordEncoder passwordEncoder; // <--- INJECT PASSWORD ENCODER

    // --- 1. STUDENT REGISTRATION ---
    public User addStudent(AddUserRequest addUserRequest) {
        User user = UserMapper.mapToUser(addUserRequest);

        // 🔒 ENCRYPT PASSWORD BEFORE SAVING
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        user.setUserType(UserType.STUDENT);
        user.setAuthorities("STUDENT"); // Students can stay as "STUDENT"

        // Verification Logic
        user.setVerified(false);
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);

        User savedUser = userRepository.save(user);

        // Send Email
        String link = "http://localhost:8081/auth/verify?token=" + token;
        try {
            notificationService.sendEmail(user.getEmail(), "Verify Account - LMS",
                    "Welcome! Click to verify: " + link);
        } catch (Exception e) {
            System.out.println("Failed to send email: " + e.getMessage());
        }

        return savedUser;
    }

    // --- 2. LOGIN LOGIC ---
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // This is correct (Lookup by Email)
        User user = userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("User does not exist");
        }

        if (!user.isVerified()) {
            throw new DisabledException("Email not verified. Please check your inbox.");
        }

        return user;
    }

    // --- 3. ADMIN REGISTRATION ---
    public User addAdmin(@Valid AddUserRequest addUserRequest){
        User user = UserMapper.mapToUser(addUserRequest);

        // 🔒 ENCRYPT PASSWORD
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        user.setUserType(UserType.ADMIN);

        // ⚠️ CRITICAL FIX: Must match SecurityConfig "hasAuthority('ROLE_ADMIN')"
        user.setAuthorities("ROLE_ADMIN");

        user.setVerified(true); // Admins auto-verified

        User savedUser = userRepository.save(user);

        if(savedUser.getEmail() != null) {
            try {
                notificationService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getName());
            } catch (Exception e) {
                System.out.println("Error sending welcome email: " + e.getMessage());
            }
        }
        return savedUser;
    }

    // --- 4. VERIFY USER ---
    public boolean verifyUser(String token) {
        User user = userRepository.findByVerificationToken(token);
        if (user == null) return false;
        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        return true;
    }

    // --- 5. PROFILE & PASSWORD UTILS ---
    public User fetchUserByEmail(String email){
        return userRepository.findByEmail(email);
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

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) return "User not found";

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        userRepository.save(user);

        String link = "http://localhost:3000/reset-password?token=" + token;
        try {
            notificationService.sendEmail(user.getEmail(), "Reset Password", "Link: " + link);
            return "Reset link sent to your email";
        } catch (Exception e) { return "Failed to send email"; }
    }

    public String resetPassword(String token, String newPassword) {
        User user = userRepository.findByVerificationToken(token);
        if (user == null) return "Invalid Token";

        // 🔒 ENCRYPT NEW PASSWORD
        user.setPassword(passwordEncoder.encode(newPassword));

        user.setVerificationToken(null);
        userRepository.save(user);
        return "Password reset successfully";
    }
}