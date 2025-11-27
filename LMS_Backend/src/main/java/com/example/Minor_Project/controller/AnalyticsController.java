package com.example.Minor_Project.controller;

import com.example.Minor_Project.enums.BookType;
import com.example.Minor_Project.enums.TransactionStatus;
import com.example.Minor_Project.enums.UserType;
import com.example.Minor_Project.repository.BookRepository;
import com.example.Minor_Project.repository.TransactionRepository;
import com.example.Minor_Project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    BookRepository bookRepository;

    @Autowired
    TransactionRepository transactionRepository;

    @GetMapping
    public Map<String, Object> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();

        // 1. KPI Cards Data
        stats.put("totalStudents", userRepository.countByUserType(UserType.STUDENT)); // Requires custom query below
        stats.put("totalBooks", bookRepository.count());
        stats.put("activeIssues", transactionRepository.countByTransactionStatus(TransactionStatus.ISSUED)); // Requires custom query below

        // 2. Pie Chart Data (Books by Type)
        Map<String, Long> booksByType = new HashMap<>();
        booksByType.put("PROGRAMMING", bookRepository.countByBookType(BookType.PROGRAMMING));
        booksByType.put("HISTORY", bookRepository.countByBookType(BookType.HISTORY));
        booksByType.put("ENGLISH", bookRepository.countByBookType(BookType.ENGLISH));
        stats.put("booksByType", booksByType);

        return stats;
    }
}