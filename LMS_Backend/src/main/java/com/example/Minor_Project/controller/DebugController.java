//package com.example.Minor_Project.controller;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
////This was to debug inorder to enter 1st admin into cloud by hetting hash value of password by password the required password in paramater
//public class DebugController {
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    // This endpoint generates a hash using YOUR specific app configuration
//    @GetMapping("/debug/generate-hash")
//    public String generateHash(@RequestParam String password) {
//        return passwordEncoder.encode(password);
//    }
//}