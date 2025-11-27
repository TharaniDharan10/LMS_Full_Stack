package com.example.Minor_Project.repository;

import com.example.Minor_Project.enums.UserType;
import com.example.Minor_Project.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public  interface  UserRepository extends JpaRepository<User,Integer> {

    User findByEmail(String email);

    User findByEmailAndUserType(String email, UserType userType);
}
