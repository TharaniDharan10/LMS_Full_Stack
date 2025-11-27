package com.example.Minor_Project.service;

import com.example.Minor_Project.dto.TransactionRequest;
import com.example.Minor_Project.enums.TransactionStatus;
import com.example.Minor_Project.enums.UserStatus;
import com.example.Minor_Project.enums.UserType;
import com.example.Minor_Project.exceptions.TransactionException;
import com.example.Minor_Project.model.Book;
import com.example.Minor_Project.model.Transaction;
import com.example.Minor_Project.model.User;
import com.example.Minor_Project.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionService {

    @Autowired
    UserService userService;

    @Autowired
    BookService bookService;

    @Autowired
    TransactionRepository transactionRepository;

    @Value("${book.maximum.validity}")    //this is used to retrieve values from application.properties
    int validDays;   //so now 14 is fetched here

    @Value("${book.fine.per.day}")
    int finePerDay;

    //as this class is annotated with FieldDefaults,so any property inside this class is private now,so inorder to access any property from outside class area especially for unit test,dont use methods like this.
    //Instead in Test ,use ReflectionTestUtils.setField(class_object , parameter , value)
    public void setValidDays(int days){
        validDays = days;
    }

    // --- MODIFIED: Accepts 'initiator' to handle Admin permissions ---
    public Transaction issueBook(User initiator, TransactionRequest request) {

        // --- LOGIC FIX: Check Permissions ---
        // If the person logged in (initiator) is NOT the person in the request form
        // AND the initiator is NOT an Admin -> Block them.
        if (!initiator.getEmail().equals(request.getUserEmail()) && initiator.getUserType() != UserType.ADMIN) {
            throw new TransactionException("You cannot issue book to some other user");
        }

        User user = fetchUser(request); //as this and next line just fetching book and not updating any table,we havenot put them inside @Transactional below and added separately

        if(user.getUserStatus() == UserStatus.BLOCKED){
            throw new TransactionException("User is blocked ,book cannot be issued");
        }

        Book book = fetchBook(request);

        // --- LOGIC FIX: Proper error message if book is taken ---
        if(book.getUser() != null){
            throw new TransactionException("Book is already issued to: " + book.getUser().getName());
        }

        return issueBook(user,book);
    }

    @Transactional
    protected Transaction issueBook(User user,Book book){
        Transaction transaction = Transaction.builder()
                .book(book)
                .user(user)
                .transactionId(UUID.randomUUID().toString().substring(0,30)) //we did substring here from 0 to 30 as our TransactionId is set to length 30
                .settlementAmount(-book.getSecurityAmount())
                .transactionStatus(TransactionStatus.ISSUED)
                .build();

        transaction = transactionRepository.save(transaction);
        book.setUser(user);
        bookService.updateBookMetaData(book);
        return transaction;
    }

    public User fetchUser(TransactionRequest request){
        User user = userService.fetchUserByEmail(request.getUserEmail());

        if(user == null){
            throw new TransactionException("User does not exist in library");
        }

        // Only Students can borrow books
        if(user.getUserType() != UserType.STUDENT){
            throw new TransactionException("Target user is not of type student");  //if i dont want for both same exception different message is shown and i want same message,then i can use findByEmailAndUserType in UserRepository
        }

        return user;
    }

    private Book fetchBook(TransactionRequest request){
        Book book = bookService.getBookByBookNo(request.getBookNo());

        if(book == null){
            throw new TransactionException("Book does not exist in library");
        }

        return book;
    }

    // --- MODIFIED: Accepts 'initiator' for Admin Return logic ---
    public Integer returnBook(User initiator, TransactionRequest request) {

        // --- LOGIC FIX: Check Permissions ---
        if (!initiator.getEmail().equals(request.getUserEmail()) && initiator.getUserType() != UserType.ADMIN) {
            throw new TransactionException("You cannot return a book for some other user");
        }

        User user = fetchUser(request); // The student who borrowed the book
        Book book = fetchBook(request);

        // Ensure the book is actually held by the user in the request
        // Note: We check IDs to be safe with object references
        if(book.getUser() == null || book.getUser().getId() != user.getId()){
            throw new TransactionException("Book is not currently issued to this user");
        }

        // --- FIX: Use the new Repo method to find the specific ACTIVE transaction ---
        // This prevents "Query did not return a unique result" error when history exists.
        Transaction transaction = transactionRepository.findTopByUserAndBookAndTransactionStatusOrderByIdDesc(
                user, book, TransactionStatus.ISSUED
        );

        if (transaction == null) {
            throw new TransactionException("No active transaction found for this book.");
        }

        return returnBook(transaction,book);
    }

    @Transactional
    protected Integer returnBook(Transaction transaction , Book book) {

        int amount = calculateFine(transaction);
        transactionRepository.save(transaction);
        book.setUser(null);
        bookService.updateBookMetaData(book);
        return amount;
    }

    public int calculateFine(Transaction transaction ){
        long issuedDateInTime = transaction.getCreatedOn().getTime(); //getCreatedOn() is of type Date .SO getTime will get it in millisec
        long currentTime = System.currentTimeMillis();
        long timeDifference = currentTime - issuedDateInTime; //in millisec

        long days = TimeUnit.MILLISECONDS.toDays(timeDifference);  //in days

        int amount = 0;
        if (days > validDays) {
            //some fine is there
            int fine = (int) (days - validDays) * finePerDay;
//            if(fine > Math.abs(transaction.getSettlementAmount())){
//                //take some money
//                amount = fine - Math.abs(transaction.getSettlementAmount());
//                transaction.setSettlementAmount(-fine);
//
//            }else{
//                //return some money
//                amount = fine - Math.abs(transaction.getSettlementAmount());
//                transaction.setSettlementAmount(-fine);
//            }

            amount = fine - Math.abs(transaction.getSettlementAmount());
            transaction.setSettlementAmount(-fine);
            transaction.setTransactionStatus(TransactionStatus.FINED);

        } else {
            transaction.setTransactionStatus(TransactionStatus.RETURNED);
            amount = transaction.getSettlementAmount();
            transaction.setSettlementAmount(0);
        }
        return amount;
    }

    public List<Transaction> getTransactionHistory(User user) {
        if (user.getUserType() == UserType.ADMIN) {
            // Admin sees EVERYTHING
            return transactionRepository.findAll();
        } else {
            // Student sees only THEIR history
            return transactionRepository.findByUser(user);
        }
    }
}