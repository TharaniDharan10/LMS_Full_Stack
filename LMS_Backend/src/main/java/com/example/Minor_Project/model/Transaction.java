package com.example.Minor_Project.model;


import com.example.Minor_Project.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SourceType;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
@Builder
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Transaction implements Serializable {   //we implement Serialisable with all model classes bcoz,if we want to store the objects of these model classes into redis(cache),which is running altogether on different server,that class should be implementing it

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;



    @Column(length = 30,nullable = false,unique = true)
//    @GeneratedValue(strategy = GenerationType.UUID) //this can also be done,but since we maintain a separate id filed above ,we didnot add this.If we want we can add this also
    String transactionId;


    @ManyToOne
    Book book;

    String paymentId;


    @ManyToOne //many books can be affored by one user
    User user;


    int settlementAmount;

    @Enumerated(value = EnumType.STRING)
    TransactionStatus transactionStatus;

    @CreationTimestamp(source = SourceType.DB)      //if its a case where we create this and UpdateTimestamp in every model,then we can make them in separate class and we can extend that class in every required model
    Date createdOn;

    @UpdateTimestamp
    Date updatedOn;


}
