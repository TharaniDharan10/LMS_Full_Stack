package com.example.Minor_Project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    @Value("${book.maximum.validity}")
    private String validity;

    // --- 1. THE GENERIC WORKER METHOD ---
    // This performs the actual network call to Gmail
    public void sendEmail(String toEmail, String subject, String body) {
        // Run in background thread to prevent UI lag
        new Thread(() -> {
            try {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setFrom(sender);
                mailMessage.setTo(toEmail);
                mailMessage.setSubject(subject);
                mailMessage.setText(body);

                javaMailSender.send(mailMessage);
                System.out.println("Email sent successfully to " + toEmail);
            } catch (Exception e) {
                System.out.println("Error sending email: " + e.getMessage());
            }
        }).start();
    }

    // --- 2. SPECIFIC BUSINESS METHODS ---
    // These prepare the text and call the worker method above

    public void sendWelcomeEmail(String toEmail, String name) {
        String subject = "Welcome to LMS_Classic";
        String body = "Dear " + name + ",\n\n" +
                "Welcome to the Athenaeum😁! Your LMS_Classic account has been created.\n" +
                "You can now browse the archives and borrow books.\n\n" +
                "Regards,\nLMS Admin";

        // Pass to the worker
        sendEmail(toEmail, subject, body);
    }

    public void sendIssueNotification(String toEmail, String name, String bookTitle, String bookNo) {
        String subject = "Book Issued: " + bookTitle;
        String body = "Dear " + name + ",\n\n" +
                "The book '" + bookTitle + "' (Ref: " + bookNo + ") has been issued to you.\n" +
                "Please return it within"+ validity +" days to avoid fines.\n\n" +
                "Regards,\nLMS Admin";

        sendEmail(toEmail, subject, body);
        System.out.println("Notification sent successfully to " + toEmail+ "for issued " + bookTitle);
    }

    public void sendReturnNotification(String toEmail, String name, String bookTitle, int fine) {
        String subject = "Return Receipt: " + bookTitle;
        String body = "Dear " + name + ",\n\n" +
                "We have received the book '" + bookTitle + "'.\n" +
                "Transaction Status: COMPLETED\n" +
                (fine > 0 ? "Fine Paid: ₹" + fine : "No Fine Applicable") + "\n\n" +
                "Thank you for using LMS_Classic.";

        sendEmail(toEmail, subject, body);
        System.out.println("Notification sent successfully to " + toEmail+ " for returning " + bookTitle);

    }
}