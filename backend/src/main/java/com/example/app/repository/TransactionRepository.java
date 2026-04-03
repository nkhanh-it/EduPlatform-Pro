package com.example.app.repository;

import com.example.app.entity.Transaction;
import com.example.app.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByStatus(PaymentStatus status);
}
