package com.example.Minor_Project.model;


import com.example.Minor_Project.enums.UserStatus;
import com.example.Minor_Project.enums.UserType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SourceType;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString(exclude = {"books", "transactions"})  // CRITICAL FIX: Exclude lazy-loaded collections from toString
@Builder
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)  // as we know that in a POJO table all parameters will be private,if we dont want to mention everytime ,we can add this line and it makes all non static fields as private

public class User implements Serializable, UserDetails { //we implement Serialisable with all model classes bcoz,if we want to store the objects of these model classes into redis(cache),which is running altogether on different server,that class should be implementing it

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @Column(length = 30)
    String name;

    @Column(unique = true, nullable = false, length = 50)//tels if there are n no of rows in a table,all of them should be unique
    String email;

    @Column(unique = true, nullable = false, length = 50)
//    @Column(unique = true, length = 15) // we didnot mention nullable bcoz i want phNo to be optional in my case
    String phoneNo;

    String temp;

    String address; // length by default is 255

    @Enumerated(value = EnumType.STRING) //(this class doesnot know that there is a enum already present,so we add this.If we didnot mention this value ,then by default ,ORDINAL number will be stored in DB.Making it string will make it get stored in DB as ADMIN and STUDENT
    UserType userType; //ADMIN , STUDENT     //this should never be taken from client during registration


    @Enumerated
    UserStatus userStatus;//0,1,2    [ORDINAL values]

    @JsonIgnore
    @OneToMany(mappedBy = "user")  // one useer can have many books
    List<Book> books;


    @JsonIgnore
    @OneToMany(mappedBy = "user")
    List<Transaction> transactions;

    String password;

    String authorities;


    @CreationTimestamp(source = SourceType.DB)//provided by JPA .By default its SourceType is SourceType.VM where VM is virtual machine.Setting it to DB will createTimeStamp based on where mysql server is running in which country server;
    Date createdOn;

    @UpdateTimestamp//provided by JPA . Similarly here also like CreationTimeStamp
    Date updatedOn;

    @Override   //actually, when a class is implementing userDetails, by default it has 3 methods to override.They are getUsername(), getPassword(), getAuthorities().But since its annotated with @Data, getters for password and authorities are set already.But we know, we cannot use getter of authorites as we store it as a string, but we know some users have multiple authorities.So we override.
    public String getUsername() {
        return email;   //unique identfier for our case
    }

    @Override   //this is from UserDetails.We override it as we store authorites as string ,but it has multiple authorites in it
    public Collection<? extends GrantedAuthority> getAuthorities(){
        return Arrays.stream(authorities.split(",")).map(authority->new SimpleGrantedAuthority(authority)).collect(Collectors.toList());  //this line takes the String of authorities, splits them, converts each splitted string into GrantedAuthority by mapping using its implementation class SimpleGrantedAuthority, and finally collected them as list

    }


}

