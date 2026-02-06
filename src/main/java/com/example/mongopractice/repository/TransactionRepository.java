package com.example.mongopractice.repository;

import com.example.mongopractice.document.Network;
import com.example.mongopractice.document.Transaction;
import com.example.mongopractice.document.Transaction.TransactionStatus;
import com.example.mongopractice.document.Transaction.TransactionType;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * TransactionRepository - Query Patterns for Wallet History
 *
 * Key insight: Index order matters!
 * Compound index {userId: 1, createdAt: -1} supports:
 * - findByUserId (uses userId prefix)
 * - findByUserIdOrderByCreatedAtDesc (full index)
 * - findByUserIdAndCreatedAtBetween (range on second field)
 *
 * Does NOT efficiently support:
 * - findByCreatedAtBetween (no userId prefix)
 */
public interface TransactionRepository extends MongoRepository<Transaction, ObjectId> {

    Optional<Transaction> findByTxHash(String txHash);

    /**
     * Basic pagination - uses index {userId: 1, createdAt: -1}
     * SQL: SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
     *
     * Performance: O(log n + k) where k = page size
     */
    Page<Transaction> findByUserIdOrderByCreatedAtDesc(ObjectId userId, Pageable pageable);

    /**
     * Filter by status - uses index {userId: 1, status: 1, createdAt: -1}
     * SQL: SELECT * FROM transactions WHERE user_id = ? AND status = ? ORDER BY created_at DESC
     */
    List<Transaction> findByUserIdAndStatusOrderByCreatedAtDesc(
            ObjectId userId,
            TransactionStatus status,
            Pageable pageable
    );

    /**
     * Multiple filters - still uses compound index efficiently
     */
    List<Transaction> findByUserIdAndNetworkAndTypeOrderByCreatedAtDesc(
            ObjectId userId,
            Network network,
            TransactionType type,
            Pageable pageable
    );

    /**
     * Date range query - index supports range on last field
     */
    @Query("{ 'userId': ?0, 'createdAt': { '$gte': ?1, '$lte': ?2 } }")
    List<Transaction> findByUserIdAndDateRange(ObjectId userId, Instant from, Instant to);

    /**
     * Count for pagination metadata
     */
    long countByUserIdAndStatus(ObjectId userId, TransactionStatus status);

    /**
     * Aggregation Pipeline - The MongoDB superpower
     *
     * SQL equivalent would need:
     * SELECT type, COUNT(*), SUM(value)
     * FROM transactions
     * WHERE user_id = ? AND created_at >= ?
     * GROUP BY type
     *
     * MongoDB does this in-database, no data transfer to application
     */
    @Aggregation(pipeline = {
        "{ '$match': { 'userId': ?0, 'createdAt': { '$gte': ?1 } } }",
        "{ '$group': { '_id': '$type', 'count': { '$sum': 1 }, 'totalValue': { '$sum': '$value' } } }",
        "{ '$project': { 'type': '$_id', 'count': 1, 'totalValue': 1, '_id': 0 } }"
    })
    List<TransactionSummary> getTransactionSummaryByType(ObjectId userId, Instant since);

    interface TransactionSummary {
        String getType();
        Long getCount();
        java.math.BigDecimal getTotalValue();
    }
}
