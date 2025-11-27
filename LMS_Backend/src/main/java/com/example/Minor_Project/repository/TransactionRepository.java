package com.example.Minor_Project.repository;

import com.example.Minor_Project.enums.TransactionStatus;
import com.example.Minor_Project.model.Book;
import com.example.Minor_Project.model.Transaction;
import com.example.Minor_Project.model.User;
import com.sun.source.tree.LambdaExpressionTree;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction,Integer> {

    // Existing method (Might return multiple results, causing your crash)
    // We keep it if used elsewhere, but we won't use it for 'return' anymore.
    Transaction findByUserEmailAndBookBookNo(String email,String bookNo);   //this is findBy(object of user object with u in capital letter and its properties object with first letter capital) And (object of book with b in capital letter and its properties object with first letter capital)

    // --- FIX: Find specifically the active ISSUED transaction ---
    // "Top...OrderByIdDesc" ensures if there are duplicates, we get the latest one.
    Transaction findTopByUserAndBookAndTransactionStatusOrderByIdDesc(User user, Book book, TransactionStatus status);

    Transaction findByUserAndBook(User user , Book book);

    long countByTransactionStatus(TransactionStatus status);

    List<Transaction> findByUser(User user);
}
