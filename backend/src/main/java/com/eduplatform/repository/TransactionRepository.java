package com.eduplatform.repository;

import com.eduplatform.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByStatus(Transaction.TransactionStatus status);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS'")
    Long getTotalRevenue();

    @Query("SELECT MONTH(t.createdAt) as month, SUM(t.amount) as total FROM Transaction t WHERE t.status = 'SUCCESS' GROUP BY MONTH(t.createdAt) ORDER BY month")
    List<Object[]> getMonthlyRevenue();

    long countByStatus(Transaction.TransactionStatus status);
}
