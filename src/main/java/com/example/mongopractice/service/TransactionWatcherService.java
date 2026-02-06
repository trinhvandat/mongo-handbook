package com.example.mongopractice.service;

import com.mongodb.client.ChangeStreamIterable;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.changestream.ChangeStreamDocument;
import com.mongodb.client.model.changestream.FullDocument;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.BsonDocument;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Watch transactions collection for real-time updates
 *
 * Use cases:
 * 1. Notify user when transaction status changes
 * 2. Update UI in real-time
 * 3. Sync to external systems (analytics, notifications)
 *
 * REQUIRES: MongoDB Replica Set
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionWatcherService {

    private final MongoTemplate mongoTemplate;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean running = new AtomicBoolean(false);

    // Store resume token để continue watching sau khi restart
    private BsonDocument lastResumeToken;

    /**
     * Start watching transactions collection
     */
    @PostConstruct
    public void startWatching() {
        // Comment out for standalone MongoDB
        // Uncomment when using Replica Set
        /*
        running.set(true);
        executor.submit(this::watchTransactions);
        log.info("Transaction watcher started");
        */
        log.info("Transaction watcher disabled (requires Replica Set)");
    }

    @PreDestroy
    public void stopWatching() {
        running.set(false);
        executor.shutdown();
        log.info("Transaction watcher stopped");
    }

    /**
     * Watch all changes on transactions collection
     */
    private void watchTransactions() {
        var collection = mongoTemplate.getCollection("transactions");

        // Filter: chỉ watch status updates
        var pipeline = List.of(
            Aggregates.match(Filters.in("operationType", List.of("insert", "update")))
        );

        try {
            ChangeStreamIterable<Document> changeStream = collection.watch(pipeline)
                .fullDocument(FullDocument.UPDATE_LOOKUP); // Include full doc on update

            // Resume từ last token nếu có (sau restart)
            if (lastResumeToken != null) {
                changeStream = changeStream.resumeAfter(lastResumeToken);
            }

            for (ChangeStreamDocument<Document> change : changeStream) {
                if (!running.get()) break;

                // Save resume token
                lastResumeToken = change.getResumeToken();

                // Process change
                processChange(change);
            }
        } catch (Exception e) {
            log.error("Change stream error: {}", e.getMessage());
            // Retry logic here
        }
    }

    /**
     * Process individual change event
     */
    private void processChange(ChangeStreamDocument<Document> change) {
        var operationType = change.getOperationType().getValue();
        var fullDocument = change.getFullDocument();

        if (fullDocument == null) {
            log.debug("Change event without full document: {}", operationType);
            return;
        }

        var txHash = fullDocument.getString("txHash");
        var status = fullDocument.getString("status");
        var userId = fullDocument.getObjectId("userId");

        switch (operationType) {
            case "insert":
                log.info("New transaction: {} for user {}", txHash, userId);
                onNewTransaction(fullDocument);
                break;

            case "update":
                log.info("Transaction updated: {} -> status: {}", txHash, status);
                if ("confirmed".equals(status)) {
                    onTransactionConfirmed(fullDocument);
                } else if ("failed".equals(status)) {
                    onTransactionFailed(fullDocument);
                }
                break;
        }
    }

    /**
     * Handler: New transaction created
     */
    private void onNewTransaction(Document tx) {
        // TODO: Send push notification
        // TODO: Update user's pending count in cache
        // TODO: Emit WebSocket event to UI
    }

    /**
     * Handler: Transaction confirmed
     */
    private void onTransactionConfirmed(Document tx) {
        // TODO: Send confirmation email/push
        // TODO: Update user balance in cache
        // TODO: Emit WebSocket event to UI
        // TODO: Log to analytics
    }

    /**
     * Handler: Transaction failed
     */
    private void onTransactionFailed(Document tx) {
        // TODO: Send failure notification
        // TODO: Trigger retry logic if applicable
    }

    /**
     * Watch specific user's transactions
     */
    public void watchUserTransactions(String userId, TransactionEventHandler handler) {
        var collection = mongoTemplate.getCollection("transactions");

        var pipeline = List.of(
            Aggregates.match(Filters.and(
                Filters.in("operationType", List.of("insert", "update")),
                Filters.eq("fullDocument.userId", userId)
            ))
        );

        executor.submit(() -> {
            try {
                for (var change : collection.watch(pipeline).fullDocument(FullDocument.UPDATE_LOOKUP)) {
                    if (!running.get()) break;
                    handler.onEvent(change);
                }
            } catch (Exception e) {
                log.error("User watch error: {}", e.getMessage());
            }
        });
    }

    @FunctionalInterface
    public interface TransactionEventHandler {
        void onEvent(ChangeStreamDocument<Document> change);
    }
}
