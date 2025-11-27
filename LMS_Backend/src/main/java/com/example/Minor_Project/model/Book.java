package com.example.Minor_Project.model;


import com.example.Minor_Project.enums.BookType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SourceType;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"user","author","transactions"})
@Data
@Builder
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Book implements Serializable {  //we implement Serialisable with all model classes bcoz,if we want to store the objects of these model classes into redis(cache),which is running altogether on different server,that class should be implementing it

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @Column(length = 30)
    String bookTitle;

    @Column(length = 10,nullable = false,unique = true)
    String bookNo;

    @Column(columnDefinition = "TEXT") // Allows long strings (summaries)
    String summary;


    int securityAmount; //all books do not have equal importance,so the collected amount is different.In case if collected amount is same,then we can add this field in application.properties

    @Enumerated(value = EnumType.STRING)//EnumType has 2 types: ordinal,string.If i want values in form of numbers,use ordinal,if i want my enum name to be same,use string
    BookType bookType;

    @ManyToOne //many book to one author.This creates One Foreign key btn Book and Author
    @JoinColumn//doing this joins author_id   i.e author_its-primary-key   .If we want some other name,we should add name parameter inside()
//    @JoinColumn(name = "authorID")//this creates a row by name authorID
//    @JsonIgnore
    @JsonIgnoreProperties("books")
    Author author;


    @OneToMany(mappedBy = "book")
    @JsonIgnore
    List<Transaction> transactions;

    @ManyToOne //many books can be affored by one user
//    @JsonIgnore
    @JoinColumn
    // ENSURE THIS IS NOT @JsonIgnore
    // We need this so we know WHO borrowed it (for history/logic)
    // This connects the book to the User (Student) who borrowed it
    @JsonIgnoreProperties("books") // Prevents infinite loop, but allows User data to be seen
    User user;

    @CreationTimestamp(source = SourceType.DB)      //if its a case where we create this and UpdateTimestamp in every model,then we can make them in separate class and we can extend that class in every required model
    Date createdOn;

    @UpdateTimestamp
    Date updatedOn;

    // Spring Boot will see "isIssued()" and add an "issued": true/false field to your JSON response
    public boolean isIssued() {
        return this.user != null;
    }
}
