package com.example.Minor_Project.test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbTest {
    public static void main(String[] args) {
        // 1. Replace with your values from the screenshot
        String host = "mysql-83-lmsclassic1.g.aivencloud.com";
        String port = "22173";
        String database = "defaultdb";
        String user = "avnadmin";
        String password = ;

        // 2. Construct the URL
        // We use verifyServerCertificate=false for the FIRST test to bypass the complex CA import steps.
        // Once this works, we can secure it further.
        String url = "jdbc:mysql://" + host + ":" + port + "/" + database +
                "?sslMode=REQUIRED&verifyServerCertificate=false&useSSL=true";

        try {
            System.out.println("Connecting to database...");
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("✅ Connection Successful!");
            conn.close();
        } catch (SQLException e) {
            System.out.println("❌ Connection Failed!");
            e.printStackTrace();
        }
    }
}