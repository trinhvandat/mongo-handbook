package com.example.mongopractice.service;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;
import static org.springframework.data.mongodb.core.aggregation.ConditionalOperators.Cond;

/**
 * Analytics Service - Aggregation Pipeline examples
 */
@Service
@RequiredArgsConstructor
public class WalletAnalyticsService {

    private final MongoTemplate mongoTemplate;

    /**
     * Dashboard summary - $facet để lấy nhiều metrics trong 1 query
     */
    public DashboardSummary getDashboardSummary(ObjectId userId) {
        var aggregation = newAggregation(
            match(Criteria.where("userId").is(userId)),

            facet()
                // Facet 1: Tổng quan
                .and(
                    group().count().as("total")
                        .sum("value").as("totalValue")
                        .avg("value").as("avgValue")
                ).as("overview")

                // Facet 2: Theo status
                .and(
                    group("status").count().as("count"),
                    project("count").and("status").previousOperation()
                ).as("byStatus")

                // Facet 3: Theo network
                .and(
                    group("network").count().as("count").sum("value").as("volume"),
                    sort(Sort.Direction.DESC, "volume")
                ).as("byNetwork")

                // Facet 4: 7 ngày gần nhất
                .and(
                    match(Criteria.where("createdAt").gte(Instant.now().minus(7, ChronoUnit.DAYS))),
                    group(DateOperators.DateToString.dateOf("createdAt").toString("%Y-%m-%d"))
                        .count().as("txCount")
                        .sum("value").as("volume"),
                    sort(Sort.Direction.DESC, "_id"),
                    limit(7)
                ).as("last7Days")
        );

        return mongoTemplate.aggregate(aggregation, "transactions", DashboardSummary.class)
                           .getUniqueMappedResult();
    }

    /**
     * Transaction size distribution - $bucket
     */
    public List<Document> getTransactionDistribution(ObjectId userId) {
        var aggregation = newAggregation(
            match(Criteria.where("userId").is(userId)),
            bucket("value")
                .withBoundaries(0, 1, 5, 10, 50, 100)
                .withDefaultBucket("100+")
                .andOutputCount().as("count")
                .andOutput(AccumulatorOperators.Sum.sumOf("value")).as("totalValue")
        );

        return mongoTemplate.aggregate(aggregation, "transactions", Document.class)
                           .getMappedResults();
    }

    /**
     * Top tokens by volume - $group + $sort
     */
    public List<TokenVolume> getTopTokensByVolume(ObjectId userId, int limit) {
        var aggregation = newAggregation(
            match(Criteria.where("userId").is(userId)
                         .and("metadata.tokenSymbol").exists(true)),
            group("metadata.tokenSymbol")
                .count().as("txCount")
                .sum("value").as("totalVolume")
                .avg("value").as("avgTxSize"),
            sort(Sort.Direction.DESC, "totalVolume"),
            limit(limit),
            project()
                .and("_id").as("tokenSymbol")
                .andInclude("txCount", "totalVolume", "avgTxSize")
        );

        return mongoTemplate.aggregate(aggregation, "transactions", TokenVolume.class)
                           .getMappedResults();
    }

    /**
     * Transaction với computed fields - $addFields + $cond
     */
    public List<EnrichedTransaction> getEnrichedTransactions(ObjectId userId, int limit) {
        var aggregation = newAggregation(
            match(Criteria.where("userId").is(userId)),
            sort(Sort.Direction.DESC, "createdAt"),
            limit(limit),

            // Add computed fields
            addFields()
                // txSize: whale/medium/small
                .addField("txSize")
                .withValue(
                    ConditionalOperators.when(Criteria.where("value").gt(5))
                        .then("whale")
                        .otherwise(
                            ConditionalOperators.when(Criteria.where("value").gt(1))
                                .then("medium")
                                .otherwise("small")
                        )
                )
                // daysSinceCreated
                .addField("daysSinceCreated")
                .withValue(
                    ArithmeticOperators.Divide.valueOf(
                        ArithmeticOperators.Subtract.valueOf("$$NOW").subtract("$createdAt")
                    ).divideBy(1000 * 60 * 60 * 24) // ms to days
                )
                .build(),

            project()
                .andInclude("txHash", "network", "type", "status", "value", "txSize")
                .and("daysSinceCreated").as("ageInDays")
        );

        return mongoTemplate.aggregate(aggregation, "transactions", EnrichedTransaction.class)
                           .getMappedResults();
    }

    /**
     * User portfolio with pending transactions - $lookup with pipeline
     */
    public UserPortfolio getUserPortfolio(String publicKey) {
        var aggregation = newAggregation(
            match(Criteria.where("publicKey").is(publicKey)),

            // Lookup pending transactions
            lookup()
                .from("transactions")
                .let(VariableOperators.Let.ExpressionVariable.newVariable("uid").forField("_id"))
                .pipeline(
                    match(Criteria.expr(
                        ComparisonOperators.Eq.valueOf("$userId").equalToValue("$$uid")
                    ).and("status").is("pending")),
                    sort(Sort.Direction.DESC, "createdAt"),
                    limit(10)
                )
                .as("pendingTransactions"),

            // Lookup recent confirmed
            lookup()
                .from("transactions")
                .let(VariableOperators.Let.ExpressionVariable.newVariable("uid").forField("_id"))
                .pipeline(
                    match(Criteria.expr(
                        ComparisonOperators.Eq.valueOf("$userId").equalToValue("$$uid")
                    ).and("status").is("confirmed")),
                    sort(Sort.Direction.DESC, "confirmedAt"),
                    limit(5)
                )
                .as("recentConfirmed"),

            project()
                .andInclude("publicKey", "displayName", "settings")
                .and(ArrayOperators.Size.lengthOfArray("pendingTransactions")).as("pendingCount")
                .and(ArrayOperators.Size.lengthOfArray("passkeys")).as("passkeyCount")
                .andInclude("pendingTransactions", "recentConfirmed")
        );

        return mongoTemplate.aggregate(aggregation, "users", UserPortfolio.class)
                           .getUniqueMappedResult();
    }

    // DTOs
    @Data
    public static class DashboardSummary {
        private List<Document> overview;
        private List<Document> byStatus;
        private List<Document> byNetwork;
        private List<Document> last7Days;
    }

    @Data
    public static class TokenVolume {
        private String tokenSymbol;
        private Long txCount;
        private BigDecimal totalVolume;
        private BigDecimal avgTxSize;
    }

    @Data
    public static class EnrichedTransaction {
        private String txHash;
        private String network;
        private String type;
        private String status;
        private BigDecimal value;
        private String txSize;
        private Double ageInDays;
    }

    @Data
    public static class UserPortfolio {
        private String publicKey;
        private String displayName;
        private Integer pendingCount;
        private Integer passkeyCount;
        private List<Document> pendingTransactions;
        private List<Document> recentConfirmed;
    }
}
