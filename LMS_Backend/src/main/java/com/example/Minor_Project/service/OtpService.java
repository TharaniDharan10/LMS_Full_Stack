package com.example.Minor_Project.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    // Storage: Phone Number -> OTP
    // In production, use Redis! This Map resets if you restart the server.
    private Map<String, String> otpStorage = new HashMap<>();

    public String generateOtp(String phoneNo) {
        // 1. Generate 6 digit random number
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        // 2. Store it
        otpStorage.put(phoneNo, otp);

        System.out.println("OTP Sent successfully (Check Console)");
        return otp;
    }

    public boolean validateOtp(String phoneNo, String inputOtp) {
        if (otpStorage.containsKey(phoneNo)) {
            String storedOtp = otpStorage.get(phoneNo);
            if (storedOtp.equals(inputOtp)) {
                otpStorage.remove(phoneNo); // OTP used once, then deleted
                return true;
            }
        }
        return false;
    }
}