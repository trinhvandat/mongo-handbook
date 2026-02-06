package com.example.mongopractice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service để analyze query performance
 * Useful for debugging slow queries
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IndexAnalyzerService {

    private final MongoTemplate mongoTemplate;

    /**
     * Get all indexes for a collection
     */
    public List<Document> getIndexes(String collectionName) {
        return mongoTemplate.getCollection(collectionName)
                           .listIndexes()
                           .into(new java.util.ArrayList<>());
    }

    /**
     * Explain a query - shows execution plan
     *
     * Returns key metrics:
     * - winningPlan.stage: COLLSCAN (bad) vs IXSCAN (good)
     * - totalKeysExamined: số index entries đã scan
     * - totalDocsExamined: số documents đã fetch
     * - executionTimeMillis: thời gian thực thi
     */
    public Document explainQuery(String collectionName, Document filter) {
        var command = new Document()
            .append("explain", new Document()
                .append("find", collectionName)
                .append("filter", filter))
            .append("verbosity", "executionStats");

        return mongoTemplate.getDb().runCommand(command);
    }

    /**
     * Analyze query performance và suggest improvements
     */
    public QueryAnalysis analyzeTransactionQuery(ObjectId userId, String status) {
        var filter = new Document()
            .append("userId", userId)
            .append("status", status);

        var explain = explainQuery("transactions", filter);
        var stats = (Document) explain.get("executionStats");
        var queryPlanner = (Document) explain.get("queryPlanner");
        var winningPlan = (Document) queryPlanner.get("winningPlan");

        var analysis = new QueryAnalysis();
        analysis.stage = winningPlan.getString("stage");
        analysis.totalKeysExamined = stats.getInteger("totalKeysExamined", 0);
        analysis.totalDocsExamined = stats.getInteger("totalDocsExamined", 0);
        analysis.nReturned = stats.getInteger("nReturned", 0);
        analysis.executionTimeMillis = stats.getInteger("executionTimeMillis", 0);

        // Calculate efficiency ratio
        if (analysis.nReturned > 0) {
            analysis.efficiency = (double) analysis.nReturned / analysis.totalDocsExamined;
        }

        // Detect issues
        if ("COLLSCAN".equals(analysis.stage)) {
            analysis.issue = "COLLECTION SCAN - Missing index!";
            analysis.suggestion = "Create index on { userId: 1, status: 1 }";
        } else if (analysis.totalDocsExamined > analysis.nReturned * 2) {
            analysis.issue = "Index not selective enough";
            analysis.suggestion = "Review index order - put high-cardinality fields first";
        }

        // Get index name if used
        if (winningPlan.containsKey("inputStage")) {
            var inputStage = (Document) winningPlan.get("inputStage");
            analysis.indexUsed = inputStage.getString("indexName");
        }

        return analysis;
    }

    /**
     * Check if query can be covered (no document fetch needed)
     */
    public boolean isQueryCovered(String collectionName, Document filter, Document projection) {
        var command = new Document()
            .append("explain", new Document()
                .append("find", collectionName)
                .append("filter", filter)
                .append("projection", projection))
            .append("verbosity", "executionStats");

        var explain = mongoTemplate.getDb().runCommand(command);
        var stats = (Document) explain.get("executionStats");

        // Covered query = totalDocsExamined is 0
        return stats.getInteger("totalDocsExamined", 1) == 0;
    }

    /**
     * Force using specific index with hint
     */
    public List<Document> queryWithHint(String collectionName, Document filter, String indexName) {
        return mongoTemplate.getCollection(collectionName)
                           .find(filter)
                           .hint(new Document(indexName, 1))
                           .into(new java.util.ArrayList<>());
    }

    public static class QueryAnalysis {
        public String stage;
        public String indexUsed;
        public int totalKeysExamined;
        public int totalDocsExamined;
        public int nReturned;
        public int executionTimeMillis;
        public double efficiency;
        public String issue;
        public String suggestion;

        @Override
        public String toString() {
            return String.format("""
                Query Analysis:
                  Stage: %s
                  Index: %s
                  Keys Examined: %d
                  Docs Examined: %d
                  Returned: %d
                  Time: %d ms
                  Efficiency: %.2f
                  Issue: %s
                  Suggestion: %s
                """,
                stage, indexUsed, totalKeysExamined, totalDocsExamined,
                nReturned, executionTimeMillis, efficiency,
                issue != null ? issue : "None",
                suggestion != null ? suggestion : "N/A"
            );
        }
    }
}
