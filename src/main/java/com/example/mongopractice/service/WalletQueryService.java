package com.example.mongopractice.service;

import com.example.mongopractice.document.Network;
import com.example.mongopractice.document.Transaction;
import com.example.mongopractice.document.Transaction.TransactionStatus;
import com.example.mongopractice.document.User;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.Decimal128;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

/**
 * WalletQueryService - Advanced Queries with MongoTemplate
 *
 * Khi nào dùng MongoTemplate thay vì Repository?
 * 1. Dynamic queries (filters thay đổi runtime)
 * 2. Complex aggregations với nhiều stages
 * 3. $lookup (JOIN equivalent)
 * 4. Khi cần full control over pipeline
 */
@Service
@RequiredArgsConstructor
public class WalletQueryService {

    private final MongoTemplate mongoTemplate;

    /**
     * $lookup = LEFT JOIN trong SQL
     *
     * SQL equivalent:
     * SELECT u.*, t.*
     * FROM users u
     * LEFT JOIN transactions t ON t.user_id = u._id
     * WHERE u.public_key = ?
     * ORDER BY t.created_at DESC
     * LIMIT 10
     *
     * IMPORTANT: $lookup is expensive! Use sparingly.
     * For wallet app, better to make 2 separate queries than 1 $lookup
     * because user data is small and cacheable.
     */
    public UserWithTransactions getUserWithRecentTransactions(String publicKey, int limit) {
        var aggregation = newAggregation(
            // Stage 1: Find user
            match(Criteria.where("publicKey").is(publicKey)),

            // Stage 2: $lookup = JOIN transactions
            lookup("transactions", "_id", "userId", "recentTransactions"),

            // Stage 3: Unwind + Sort + Limit (process joined data)
            unwind("recentTransactions", true), // preserveNullAndEmptyArrays = true
            sort(Sort.by(Sort.Direction.DESC, "recentTransactions.createdAt")),
            limit(limit),

            // Stage 4: Group back to single user document
            group("_id")
                .first("publicKey").as("publicKey")
                .first("displayName").as("displayName")
                .first("settings").as("settings")
                .push("recentTransactions").as("recentTransactions")
        );

        var results = mongoTemplate.aggregate(
            aggregation, "users", UserWithTransactions.class
        );

        return results.getUniqueMappedResult();
    }

    /**
     * Faceted Search - Multiple aggregations in single query
     *
     * SQL would need multiple queries:
     * Query 1: SELECT COUNT(*) FROM tx WHERE user_id = ? AND status = 'pending'
     * Query 2: SELECT COUNT(*) FROM tx WHERE user_id = ? AND status = 'confirmed'
     * Query 3: SELECT network, COUNT(*) FROM tx WHERE user_id = ? GROUP BY network
     *
     * MongoDB: Single round-trip with $facet
     */
    public TransactionStats getTransactionStats(ObjectId userId, Instant since) {
        var aggregation = newAggregation(
            match(Criteria.where("userId").is(userId)
                         .and("createdAt").gte(since)),

            facet(
                // Facet 1: Count by status
                newAggregation(
                    group("status").count().as("count"),
                    project("count").and("status").previousOperation()
                ).getPipeline().getOperations().toArray(new AggregationOperation[0])
            ).as("byStatus"),

            facet(
                // Facet 2: Count by network
                newAggregation(
                    group("network").count().as("count"),
                    project("count").and("network").previousOperation()
                ).getPipeline().getOperations().toArray(new AggregationOperation[0])
            ).as("byNetwork"),

            facet(
                // Facet 3: Total value
                newAggregation(
                    group().sum("value").as("total")
                ).getPipeline().getOperations().toArray(new AggregationOperation[0])
            ).as("totalValue")
        );

        return mongoTemplate.aggregate(aggregation, "transactions", TransactionStats.class)
                           .getUniqueMappedResult();
    }

    /**
     * Dynamic Query Builder - Khi filters thay đổi runtime
     *
     * SQL: WHERE 1=1 AND (network = ? OR TRUE) AND (type = ? OR TRUE) ...
     * This is where MongoDB Query DSL shines
     */
    public List<Transaction> searchTransactions(TransactionSearchCriteria criteria) {
        var criteriaBuilder = Criteria.where("userId").is(criteria.getUserId());

        if (criteria.getNetwork() != null) {
            criteriaBuilder.and("network").is(criteria.getNetwork());
        }
        if (criteria.getStatus() != null) {
            criteriaBuilder.and("status").is(criteria.getStatus());
        }
        if (criteria.getFromDate() != null) {
            criteriaBuilder.and("createdAt").gte(criteria.getFromDate());
        }
        if (criteria.getToDate() != null) {
            criteriaBuilder.and("createdAt").lte(criteria.getToDate());
        }
        if (criteria.getMinValue() != null) {
            criteriaBuilder.and("value").gte(new Decimal128(criteria.getMinValue()));
        }
        // Wildcard index query on metadata
        if (criteria.getTokenSymbol() != null) {
            criteriaBuilder.and("metadata.tokenSymbol").is(criteria.getTokenSymbol());
        }

        var aggregation = newAggregation(
            match(criteriaBuilder),
            sort(Sort.by(Sort.Direction.DESC, "createdAt")),
            skip((long) criteria.getPage() * criteria.getSize()),
            limit(criteria.getSize())
        );

        return mongoTemplate.aggregate(aggregation, "transactions", Transaction.class)
                           .getMappedResults();
    }

    /**
     * Bucket Aggregation - Group transactions by value ranges
     * Useful for analytics dashboards
     *
     * Using raw Document for complex aggregation that Spring Data doesn't fully support
     */
    public List<Document> getTransactionDistribution(ObjectId userId) {
        var aggregation = newAggregation(
            match(Criteria.where("userId").is(userId)),
            bucketAuto("value", 5)
                .andOutputCount().as("count")
        );

        return mongoTemplate.aggregate(aggregation, "transactions", Document.class)
                           .getMappedResults();
    }

    // DTOs
    @Data
    public static class UserWithTransactions {
        private ObjectId id;
        private String publicKey;
        private String displayName;
        private User.UserSettings settings;
        private List<Transaction> recentTransactions;
    }

    @Data
    public static class TransactionStats {
        private List<Document> byStatus;
        private List<Document> byNetwork;
        private List<Document> totalValue;
    }

    @Data
    @Builder
    public static class TransactionSearchCriteria {
        private ObjectId userId;
        private Network network;
        private TransactionStatus status;
        private Instant fromDate;
        private Instant toDate;
        private BigDecimal minValue;
        private String tokenSymbol;
        @Builder.Default
        private int page = 0;
        @Builder.Default
        private int size = 20;
    }
}
