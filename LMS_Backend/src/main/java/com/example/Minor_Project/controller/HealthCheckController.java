package com.example.Minor_Project.controller;

import com.example.Minor_Project.model.User;
import com.example.Minor_Project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class HealthCheckController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/health")
    public String healthCheck() {
        return "Backend is running on port 8081!";
    }

    @GetMapping("/test-auth")
    public String testAuth() {
        return "Authentication is working!";
    }

    @GetMapping("/debug/users")
    public String listUsers() {
        List<User> users = userRepository.findAll();
        StringBuilder result = new StringBuilder();
        result.append("=================================\n");
        result.append("Total Users in Database: ").append(users.size()).append("\n");
        result.append("=================================\n\n");

        for (User user : users) {
            result.append("User #").append(user.getId()).append(":\n");
            result.append("  - Name: ").append(user.getName()).append("\n");
            result.append("  - Email: ").append(user.getEmail()).append("\n");
            result.append("  - Phone: ").append(user.getPhoneNo()).append("\n");
            result.append("  - Password: ").append(user.getPassword()).append("\n");
            result.append("  - Type: ").append(user.getUserType()).append("\n");
            result.append("  - Authorities: ").append(user.getAuthorities()).append("\n");
            result.append("  - Username (from getUsername()): ").append(user.getUsername()).append("\n");
            result.append("---------------------------------\n");
        }

        if (users.isEmpty()) {
            result.append("NO USERS FOUND! Please register a user first.\n");
        }

        return result.toString();
    }

    @GetMapping("/debug/user/{email}")
    public String getUser(@PathVariable String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            return String.format(
                    "Found user:\n" +
                            "  - Name: %s\n" +
                            "  - Email: %s\n" +
                            "  - Password: %s\n" +
                            "  - Type: %s\n" +
                            "  - Authorities: %s\n" +
                            "  - getUsername() returns: %s",
                    user.getName(),
                    user.getEmail(),
                    user.getPassword(),
                    user.getUserType(),
                    user.getAuthorities(),
                    user.getUsername()
            );
        }
        return "User not found with email: " + email;
    }
}