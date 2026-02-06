package com.example.mongopractice.service;

import com.example.mongopractice.document.Network;
import com.example.mongopractice.document.Transaction;
import com.example.mongopractice.document.Transaction.TransactionStatus;
import com.example.mongopractice.document.Transaction.TransactionType;
import com.example.mongopractice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.Decimal128;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final MongoTemplate mongoTemplate;

    public Transaction createTransaction(
            ObjectId userId,
            String txHash,
            Network network,
            TransactionType type,
            String from,
            String to,
            BigDecimal value
    ) {
        var tx = Transaction.builder()
            .userId(userId)
            .txHash(txHash)
            .network(network)
            .type(type)
            .status(TransactionStatus.pending)
            .from(from)
            .to(to)
            .value(new Decimal128(value))
            .createdAt(Instant.now())
            .build();

        return transactionRepository.save(tx);
    }

    public Optional<Transaction> findByTxHash(String txHash) {
        return transactionRepository.findByTxHash(txHash);
    }

    /**
     * Get user's transaction history with pagination
     *
     * Performance: O(log n + k) with index
     * - log n: B-tree traversal to find userId
     * - k: page size (sequential scan of sorted data)
     */
    public Page<Transaction> getUserTransactions(ObjectId userId, int page, int size) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(
            userId,
            PageRequest.of(page, size)
        );
    }

    /**
     * Confirm transaction - Update status and add confirmation data
     *
     * Optimistic concurrency: check current status before update
     */
    public boolean confirmTransaction(String txHash, Long blockNumber, Long gasUsed, BigDecimal gasPrice) {
        var query = Query.query(
            Criteria.where("txHash").is(txHash)
                   .and("status").is(TransactionStatus.pending) // Only update if pending
        );

        var update = new Update()
            .set("status", TransactionStatus.confirmed)
            .set("blockNumber", blockNumber)
            .set("gasUsed", gasUsed)
            .set("gasPrice", new Decimal128(gasPrice))
            .set("confirmedAt", Instant.now());

        var result = mongoTemplate.updateFirst(query, update, Transaction.class);
        return result.getModifiedCount() > 0;
    }

    /**
     * Bulk update - Mark old pending transactions as failed
     * Useful for cleanup jobs
     */
    public long markStalePendingAsFailed(Instant threshold) {
        var query = Query.query(
            Criteria.where("status").is(TransactionStatus.pending)
                   .and("createdAt").lt(threshold)
        );

        var update = new Update()
            .set("status", TransactionStatus.failed);

        return mongoTemplate.updateMulti(query, update, Transaction.class)
                           .getModifiedCount();
    }

    /**
     * Get pending transactions count for user
     * Useful for UI badges
     */
    public long getPendingCount(ObjectId userId) {
        return transactionRepository.countByUserIdAndStatus(userId, TransactionStatus.pending);
    }

    /**
     * Get transaction summary by type
     */
    public List<TransactionRepository.TransactionSummary> getTransactionSummary(
            ObjectId userId,
            Instant since
    ) {
        return transactionRepository.getTransactionSummaryByType(userId, since);
    }
}
