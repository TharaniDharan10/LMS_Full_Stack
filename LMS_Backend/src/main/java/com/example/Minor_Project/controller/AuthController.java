package com.example.Minor_Project.controller;

import com.example.Minor_Project.service.OtpService;
import com.example.Minor_Project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    UserService userService;

    @Autowired
    OtpService otpService;

    // --- 1. EMAIL VERIFICATION (Existing) ---
    @GetMapping("/verify")
    public ResponseEntity<String> verifyAccount(@RequestParam("token") String token) {
        boolean success = userService.verifyUser(token);
        if (success) {
            return ResponseEntity.ok("<h1>Account Verified!</h1><p>You can now return to the app and login.</p>");
        } else {
            return ResponseEntity.badRequest().body("<h1>Invalid or Expired Token</h1>");
        }
    }

    // --- 2. FORGOT PASSWORD (Existing) ---
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam("email") String email) {
        String response = userService.forgotPassword(email);
        if (response.startsWith("Reset link")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // --- 3. RESET PASSWORD (Existing) ---
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

    // --- 4. SEND OTP (For Auto-fill) ---
    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(@RequestParam String phoneNo) {
        // This generates the number AND returns it
        String generatedOtp = otpService.generateOtp(phoneNo);

        // Return JSON so Frontend can grab the code
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent successfully!");
        response.put("otp", generatedOtp); // <--- The Frontend reads this for auto-fill

        return response;
    }

    // --- 5. VERIFY OTP (THIS WAS MISSING) ---
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestParam String phoneNo, @RequestParam String otp) {
        if (otpService.validateOtp(phoneNo, otp)) {
            return ResponseEntity.ok("Phone Verified Successfully");
        } else {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }
    }
}