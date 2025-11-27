package com.example.Minor_Project.repository;

import com.example.Minor_Project.model.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Comparator;

@Repository
public interface AuthorRepository extends JpaRepository<Author,Integer> {
    //Query type 1(NativeQuery)
    @Query(value = "select * from author where email = :email",nativeQuery = true)
    Author fetchAuthorByEmailByNativeQuery(String email);



    //Query type 2(No query at all)
    //Here method name should be findBycapitalised_field and this is taken care by jpa amd hibernate
    Author findByEmail(String email);


}


