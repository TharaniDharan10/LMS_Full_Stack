package com.example.Minor_Project.controller;

import com.example.Minor_Project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map; // <--- MAKE SURE THIS IS IMPORTED

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    UserService userService;

    @GetMapping("/verify")
    public ResponseEntity<String> verifyAccount(@RequestParam("token") String token) {
        boolean success = userService.verifyUser(token);
        if (success) {
            return ResponseEntity.ok("<h1>Account Verified!</h1><p>You can now return to the app and login.</p>");
        } else {
            return ResponseEntity.badRequest().body("<h1>Invalid or Expired Token</h1>");
        }
    }

    // --- ENSURE THIS IS PRESENT ---
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam("email") String email) {
        String response = userService.forgotPassword(email);
        if (response.startsWith("Reset link")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // --- ENSURE THIS IS PRESENT ---
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        String response = userService.resetPassword(token, newPassword);
        if (response.contains("successfully")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
}