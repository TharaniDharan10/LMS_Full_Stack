//package com.example.Minor_Project.repository;
//
//import com.example.Minor_Project.enums.BookType;
//import com.example.Minor_Project.model.Book;
//import jakarta.persistence.EntityManager;
//import jakarta.persistence.criteria.CriteriaBuilder;
//import jakarta.persistence.criteria.CriteriaQuery;
//import jakarta.persistence.criteria.Predicate;
//import jakarta.persistence.criteria.Root;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Repository;
//
//import java.util.ArrayList;
//import java.util.List;
//
////here in criteria query,we have to rely on hibernate to convert criteria queries into native queries
//@Repository
//public class CustomBookRepositoryImpl implements CustomBookRepository{  //when we make a class with an interface name followed by Impl,it automatically gives implementation for that interface
//
//
//    @Autowired
//    EntityManager entityManager;
//
//
//    @Override
//    public List<Book> findBookByFilters(String bookTitle, BookType bookType) {
//        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
//        CriteriaQuery<Book> criteriaQuery = criteriaBuilder.createQuery(Book.class);
//        Root<Book> bookRoot = criteriaQuery.from(Book.class);
//
//        //I want to make a query select * from book where booktitle like "%Java%" or booktype = "ENGLISH"
//        //So we have 3 things(operand[booktitle,booktype] , operator[or,like,between,<,>,=] , value[%Java%,ENGLISH])
//        List<Predicate> predicates  = new ArrayList<>();    //in JPA terminology,these filter are known as Predicate
//
//        //for each filter i need one predicate
//        if(bookTitle != null && !bookTitle.isEmpty()){
//            Predicate titlePredicate = criteriaBuilder.like(bookRoot.get("bookTitle") , "%" + bookTitle + "%");
//            predicates.add(titlePredicate);
//
//        }
//
//        if(bookType != null){
//            Predicate typePredicate = criteriaBuilder.equal(bookRoot.get("bookType") , bookType);
//            predicates.add(typePredicate);
//        }
//
//        Predicate finalPredicate = criteriaBuilder.or(predicates.toArray(new Predicate[0])) ;
//
////        Predicate amountPredicate = criteriaBuilder.equal(bookRoot.get("securityAmount"),100);
////        Predicate final2 = criteriaBuilder.and(finalPredicate,amountPredicate);   //simply made to show "and" query.In this case,replace next to next line as criteriaQuery.select(bookRoot).where(final2);
//
////        criteriaQuery.select(bookRoot).where(predicates.toArray(new Predicate[0])); //in this scenario,the above queries are clubbed using "and" class.but we need "or" class
//        criteriaQuery.select(bookRoot).where(finalPredicate);
//
//        return entityManager.createQuery(criteriaQuery).getResultList();
//    }
//}
