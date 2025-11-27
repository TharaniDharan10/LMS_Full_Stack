package com.example.Minor_Project.dto;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String phoneNo;
    private String address;
}