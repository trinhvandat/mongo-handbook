package com.example.mongopractice.migration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

/**
 * Schema Versioning Strategies for MongoDB
 *
 * Unlike SQL, MongoDB doesn't require ALTER TABLE.
 * But you need strategies to handle mixed schema versions.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SchemaVersioning {

    private static final int CURRENT_USER_SCHEMA_VERSION = 2;
    private final MongoTemplate mongoTemplate;

    /**
     * Strategy 1: Lazy Migration (On-Read)
     *
     * When reading old documents, migrate them to new schema.
     * Pros: No downtime, gradual migration
     * Cons: Read performance hit, mixed versions in DB
     */
    public Document migrateUserOnRead(Document user) {
        int version = user.getInteger("schemaVersion", 1);

        if (version < CURRENT_USER_SCHEMA_VERSION) {
            // Migrate v1 → v2: Add default settings if missing
            if (version < 2) {
                if (!user.containsKey("settings")) {
                    user.put("settings", new Document()
                        .append("notificationsEnabled", true)
                        .append("defaultNetwork", "ethereum"));
                }
                if (!user.containsKey("passkeys")) {
                    user.put("passkeys", java.util.Collections.emptyList());
                }
            }

            // Update schema version
            user.put("schemaVersion", CURRENT_USER_SCHEMA_VERSION);

            // Persist migration (async in production)
            mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(user.get("_id"))),
                Update.update("schemaVersion", CURRENT_USER_SCHEMA_VERSION)
                      .set("settings", user.get("settings"))
                      .set("passkeys", user.get("passkeys")),
                "users"
            );

            log.info("Migrated user {} from v{} to v{}",
                user.getString("publicKey"), version, CURRENT_USER_SCHEMA_VERSION);
        }

        return user;
    }

    /**
     * Strategy 2: Background Migration (Batch)
     *
     * Run migration job to update all old documents.
     * Pros: Clean data, no read-time overhead
     * Cons: Need to handle during migration window
     */
    public long runBackgroundMigration(int batchSize) {
        long totalMigrated = 0;

        while (true) {
            // Find batch of old documents
            var oldDocs = mongoTemplate.find(
                Query.query(Criteria.where("schemaVersion").lt(CURRENT_USER_SCHEMA_VERSION)
                                   .orOperator(Criteria.where("schemaVersion").exists(false)))
                     .limit(batchSize),
                Document.class,
                "users"
            );

            if (oldDocs.isEmpty()) {
                break;
            }

            for (var doc : oldDocs) {
                migrateUserOnRead(doc);
                totalMigrated++;
            }

            log.info("Migrated batch of {} users, total: {}", oldDocs.size(), totalMigrated);
        }

        return totalMigrated;
    }

    /**
     * Strategy 3: Schema Validation (MongoDB 3.6+)
     *
     * Use JSON Schema to enforce structure on writes.
     * Old documents are NOT affected, only new writes.
     */
    public void updateSchemaValidation() {
        var command = new Document()
            .append("collMod", "users")
            .append("validator", new Document()
                .append("$jsonSchema", new Document()
                    .append("bsonType", "object")
                    .append("required", java.util.Arrays.asList("publicKey", "createdAt", "schemaVersion"))
                    .append("properties", new Document()
                        .append("schemaVersion", new Document()
                            .append("bsonType", "int")
                            .append("minimum", CURRENT_USER_SCHEMA_VERSION)))))
            .append("validationLevel", "moderate") // moderate = only validate inserts and updates
            .append("validationAction", "warn");   // warn = log but don't reject

        mongoTemplate.getDb().runCommand(command);
        log.info("Updated schema validation for users collection");
    }

    /**
     * Strategy 4: Field Rename (Aggregation Pipeline)
     *
     * MongoDB doesn't have RENAME field. Use aggregation to copy.
     */
    public void renameField(String collection, String oldName, String newName) {
        // Using aggregation pipeline update (MongoDB 4.2+)
        var pipeline = java.util.Arrays.asList(
            new Document("$set", new Document(newName, "$" + oldName)),
            new Document("$unset", oldName)
        );

        mongoTemplate.getCollection(collection).updateMany(
            new Document(oldName, new Document("$exists", true)),
            pipeline
        );

        log.info("Renamed field {} to {} in {}", oldName, newName, collection);
    }

    /**
     * Startup check: Log schema version stats
     */
    @EventListener(ApplicationReadyEvent.class)
    public void logSchemaStats() {
        var stats = mongoTemplate.getCollection("users").aggregate(java.util.Arrays.asList(
            new Document("$group", new Document()
                .append("_id", new Document("$ifNull",
                    java.util.Arrays.asList("$schemaVersion", 1)))
                .append("count", new Document("$sum", 1)))
        )).into(new java.util.ArrayList<>());

        log.info("User schema version distribution:");
        for (var stat : stats) {
            log.info("  Version {}: {} documents", stat.get("_id"), stat.get("count"));
        }
    }
}
