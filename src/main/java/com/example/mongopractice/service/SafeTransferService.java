package com.example.mongopractice.service;

import com.example.mongopractice.config.MongoReplicaSetConfig.ReadPreferences;
import com.example.mongopractice.config.MongoReplicaSetConfig.WriteConcerns;
import com.example.mongopractice.document.Transaction;
import com.mongodb.client.model.changestream.ChangeStreamDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.types.Decimal128;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Service với proper Write Concern cho financial operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SafeTransferService {

    private final MongoTemplate mongoTemplate;

    /**
     * Transfer với Write Concern = majority
     * Đảm bảo data được replicate trước khi return success
     */
    public void safeTransfer(String from, String to, BigDecimal amount) {
        // Lấy collection với custom write concern
        var usersCollection = mongoTemplate.getDb()
            .getCollection("users")
            .withWriteConcern(WriteConcerns.FINANCIAL);

        // 1. Deduct from sender
        var deductResult = usersCollection.updateOne(
            new Document("publicKey", from)
                .append("balance", new Document("$gte", new Decimal128(amount))),
            new Document("$inc", new Document("balance", new Decimal128(amount.negate())))
        );

        if (deductResult.getModifiedCount() == 0) {
            throw new RuntimeException("Insufficient balance or user not found");
        }
        log.info("Deducted {} from {} - acknowledged by majority", amount, from);

        // 2. Credit to receiver
        var creditResult = usersCollection.updateOne(
            new Document("publicKey", to),
            new Document("$inc", new Document("balance", new Decimal128(amount)))
        );

        if (creditResult.getMatchedCount() == 0) {
            // Rollback - phải dùng cùng write concern
            usersCollection.updateOne(
                new Document("publicKey", from),
                new Document("$inc", new Document("balance", new Decimal128(amount)))
            );
            throw new RuntimeException("Receiver not found, rolled back");
        }
        log.info("Credited {} to {} - acknowledged by majority", amount, to);
    }

    /**
     * Đọc balance - phải consistent (từ Primary)
     */
    public BigDecimal getBalanceConsistent(String publicKey) {
        var collection = mongoTemplate.getDb()
            .getCollection("users")
            .withReadPreference(ReadPreferences.CONSISTENT);

        var user = collection.find(new Document("publicKey", publicKey)).first();
        if (user == null) return BigDecimal.ZERO;

        var balance = user.get("balance", Decimal128.class);
        return balance != null ? balance.bigDecimalValue() : BigDecimal.ZERO;
    }

    /**
     * Đọc transaction history - có thể từ Secondary (analytics)
     */
    public long countTransactionsAnalytics(String userId) {
        var collection = mongoTemplate.getDb()
            .getCollection("transactions")
            .withReadPreference(ReadPreferences.ANALYTICS);

        return collection.countDocuments(new Document("userId", userId));
    }

    /**
     * Log activity - không cần đợi confirm (fire and forget)
     */
    public void logActivity(String userId, String action) {
        var logsCollection = mongoTemplate.getDb()
            .getCollection("activity_logs")
            .withWriteConcern(WriteConcerns.FIRE_AND_FORGET);

        logsCollection.insertOne(new Document()
            .append("userId", userId)
            .append("action", action)
            .append("timestamp", System.currentTimeMillis())
        );
        // Returns immediately, không đợi DB confirm
    }
}
