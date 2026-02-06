package com.example.mongopractice.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Performance Monitor - Detect slow queries và suggest fixes
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PerformanceMonitorService {

    private final MongoTemplate mongoTemplate;

    /**
     * Analyze query và return performance metrics
     */
    public QueryMetrics analyzeQuery(String collection, Document filter) {
        var command = new Document()
            .append("explain", new Document()
                .append("find", collection)
                .append("filter", filter))
            .append("verbosity", "executionStats");

        var explain = mongoTemplate.getDb().runCommand(command);
        var stats = (Document) explain.get("executionStats");
        var planner = (Document) explain.get("queryPlanner");
        var plan = (Document) planner.get("winningPlan");

        var metrics = new QueryMetrics();
        metrics.setCollection(collection);
        metrics.setFilter(filter.toJson());
        metrics.setStage(plan.getString("stage"));
        metrics.setTotalKeysExamined(stats.getInteger("totalKeysExamined", 0));
        metrics.setTotalDocsExamined(stats.getInteger("totalDocsExamined", 0));
        metrics.setNReturned(stats.getInteger("nReturned", 0));
        metrics.setExecutionTimeMs(stats.getInteger("executionTimeMillis", 0));

        // Get index name if used
        if (plan.containsKey("inputStage")) {
            var inputStage = (Document) plan.get("inputStage");
            metrics.setIndexUsed(inputStage.getString("indexName"));
        }

        // Calculate efficiency
        if (metrics.getNReturned() > 0) {
            metrics.setEfficiency(
                (double) metrics.getNReturned() / metrics.getTotalDocsExamined()
            );
        }

        // Detect issues và suggest fixes
        detectIssues(metrics);

        return metrics;
    }

    private void detectIssues(QueryMetrics metrics) {
        List<String> issues = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        // Issue 1: COLLSCAN
        if ("COLLSCAN".equals(metrics.getStage())) {
            issues.add("COLLECTION SCAN - No index used");
            suggestions.add("Create index on filter fields");
        }

        // Issue 2: High docs examined ratio
        if (metrics.getNReturned() > 0 &&
            metrics.getTotalDocsExamined() > metrics.getNReturned() * 2) {
            issues.add("High scan ratio: " + metrics.getTotalDocsExamined() +
                      "/" + metrics.getNReturned());
            suggestions.add("Index may not be selective enough");
        }

        // Issue 3: In-memory sort (detected by stage)
        if ("SORT".equals(metrics.getStage())) {
            issues.add("In-memory SORT detected");
            suggestions.add("Add sort field to compound index");
        }

        // Issue 4: Slow query
        if (metrics.getExecutionTimeMs() > 100) {
            issues.add("Slow query: " + metrics.getExecutionTimeMs() + "ms");
            suggestions.add("Review query plan and indexes");
        }

        metrics.setIssues(issues);
        metrics.setSuggestions(suggestions);
    }

    /**
     * Get collection statistics
     */
    public CollectionStats getCollectionStats(String collection) {
        var stats = mongoTemplate.getDb()
            .runCommand(new Document("collStats", collection));

        var result = new CollectionStats();
        result.setCollection(collection);
        result.setDocumentCount(stats.getInteger("count", 0));
        result.setSizeBytes(stats.getLong("size"));
        result.setAvgDocSizeBytes(stats.getInteger("avgObjSize", 0));
        result.setIndexCount(stats.getInteger("nindexes", 0));
        result.setTotalIndexSizeBytes(stats.getLong("totalIndexSize"));

        return result;
    }

    /**
     * List all indexes với usage stats
     */
    public List<IndexInfo> getIndexUsageStats(String collection) {
        var indexes = mongoTemplate.getCollection(collection)
            .listIndexes()
            .into(new ArrayList<>());

        var result = new ArrayList<IndexInfo>();
        for (var idx : indexes) {
            var info = new IndexInfo();
            info.setName(idx.getString("name"));
            info.setKey(((Document) idx.get("key")).toJson());
            info.setUnique(idx.getBoolean("unique", false));
            result.add(info);
        }

        return result;
    }

    /**
     * Scheduled job: Log slow query warnings
     * Chạy mỗi 5 phút, check profile collection
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void checkSlowQueries() {
        try {
            var slowQueries = mongoTemplate.getDb()
                .getCollection("system.profile")
                .find(new Document("millis", new Document("$gt", 100)))
                .sort(new Document("ts", -1))
                .limit(10)
                .into(new ArrayList<>());

            for (var query : slowQueries) {
                log.warn("Slow query detected: {}ms on {} - {}",
                    query.getInteger("millis"),
                    query.getString("ns"),
                    query.getString("planSummary")
                );
            }
        } catch (Exception e) {
            // Profile collection may not exist or no permission
            log.debug("Could not check slow queries: {}", e.getMessage());
        }
    }

    // DTOs
    @Data
    public static class QueryMetrics {
        private String collection;
        private String filter;
        private String stage;
        private String indexUsed;
        private int totalKeysExamined;
        private int totalDocsExamined;
        private int nReturned;
        private int executionTimeMs;
        private double efficiency;
        private List<String> issues;
        private List<String> suggestions;
    }

    @Data
    public static class CollectionStats {
        private String collection;
        private int documentCount;
        private long sizeBytes;
        private int avgDocSizeBytes;
        private int indexCount;
        private long totalIndexSizeBytes;
    }

    @Data
    public static class IndexInfo {
        private String name;
        private String key;
        private boolean unique;
    }
}
