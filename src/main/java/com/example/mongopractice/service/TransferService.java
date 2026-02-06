package com.example.mongopractice.service;

import com.example.mongopractice.document.Network;
import com.example.mongopractice.document.Transaction;
import com.example.mongopractice.document.Transaction.TransactionStatus;
import com.example.mongopractice.document.Transaction.TransactionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.Decimal128;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Transfer Service - Multi-Document Transaction Example
 *
 * IMPORTANT: Transactions require:
 * 1. MongoDB Replica Set (not standalone)
 * 2. Spring's MongoTransactionManager configured
 *
 * For standalone: Use saga pattern or two-phase commit manually
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransferService {

    private final MongoTemplate mongoTemplate;

    /**
     * Transfer balance between users - Requires Replica Set
     *
     * @Transactional sẽ:
     * 1. Start MongoDB session
     * 2. Start transaction
     * 3. Execute all operations
     * 4. Commit on success / Rollback on exception
     */
    @Transactional
    public TransferResult transfer(String fromPublicKey, String toPublicKey, BigDecimal amount) {
        log.info("Starting transfer: {} -> {}, amount: {}", fromPublicKey, toPublicKey, amount);

        // 1. Deduct from sender (with balance check)
        var deductResult = mongoTemplate.updateFirst(
            Query.query(Criteria.where("publicKey").is(fromPublicKey)
                               .and("balance").gte(new Decimal128(amount))), // Optimistic lock
            new Update().inc("balance", new Decimal128(amount.negate())),
            "users"
        );

        if (deductResult.getModifiedCount() == 0) {
            throw new InsufficientBalanceException("Insufficient balance for " + fromPublicKey);
        }

        // 2. Add to receiver
        var addResult = mongoTemplate.updateFirst(
            Query.query(Criteria.where("publicKey").is(toPublicKey)),
            new Update().inc("balance", new Decimal128(amount)),
            "users"
        );

        if (addResult.getMatchedCount() == 0) {
            throw new UserNotFoundException("Receiver not found: " + toPublicKey);
        }

        // 3. Record transaction
        var txHash = "0x" + UUID.randomUUID().toString().replace("-", "") +
                     UUID.randomUUID().toString().replace("-", "").substring(0, 32);

        var transaction = Transaction.builder()
            .txHash(txHash)
            .network(Network.ethereum)
            .type(TransactionType.send)
            .status(TransactionStatus.confirmed)
            .from(fromPublicKey)
            .to(toPublicKey)
            .value(new Decimal128(amount))
            .createdAt(Instant.now())
            .confirmedAt(Instant.now())
            .build();

        mongoTemplate.save(transaction);

        log.info("Transfer completed: txHash={}", txHash);

        return new TransferResult(txHash, fromPublicKey, toPublicKey, amount);
    }

    /**
     * Alternative: Two-Phase Commit Pattern (for standalone MongoDB)
     *
     * Phase 1: Prepare - Create pending transfer record
     * Phase 2: Commit - Execute transfer, update status
     *
     * If failure between phases → Recovery job cleans up
     */
    public TransferResult transferWithTwoPhaseCommit(String from, String to, BigDecimal amount) {
        // Phase 1: Create pending transfer
        var transferId = new ObjectId();
        var pendingTransfer = new org.bson.Document()
            .append("_id", transferId)
            .append("from", from)
            .append("to", to)
            .append("amount", new Decimal128(amount))
            .append("status", "pending")
            .append("createdAt", Instant.now());

        mongoTemplate.getCollection("pending_transfers").insertOne(pendingTransfer);

        try {
            // Phase 2: Execute
            // Deduct from sender
            var deductResult = mongoTemplate.updateFirst(
                Query.query(Criteria.where("publicKey").is(from)
                                   .and("balance").gte(new Decimal128(amount))),
                new Update()
                    .inc("balance", new Decimal128(amount.negate()))
                    .push("pendingTransfers", transferId),
                "users"
            );

            if (deductResult.getModifiedCount() == 0) {
                throw new InsufficientBalanceException("Insufficient balance");
            }

            // Add to receiver
            mongoTemplate.updateFirst(
                Query.query(Criteria.where("publicKey").is(to)),
                new Update()
                    .inc("balance", new Decimal128(amount))
                    .push("pendingTransfers", transferId),
                "users"
            );

            // Mark transfer as completed
            mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(transferId)),
                new Update().set("status", "completed").set("completedAt", Instant.now()),
                "pending_transfers"
            );

            // Cleanup pending references
            mongoTemplate.updateMulti(
                Query.query(Criteria.where("pendingTransfers").is(transferId)),
                new Update().pull("pendingTransfers", transferId),
                "users"
            );

            return new TransferResult(transferId.toHexString(), from, to, amount);

        } catch (Exception e) {
            // Rollback: Mark as failed, recovery job will handle
            mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(transferId)),
                new Update().set("status", "failed").set("error", e.getMessage()),
                "pending_transfers"
            );
            throw e;
        }
    }

    public record TransferResult(String txHash, String from, String to, BigDecimal amount) {}

    public static class InsufficientBalanceException extends RuntimeException {
        public InsufficientBalanceException(String message) { super(message); }
    }

    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(String message) { super(message); }
    }
}
