package com.example.mongopractice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;

/**
 * MongoDB Configuration
 *
 * MongoTransactionManager enables @Transactional for multi-document transactions
 * REQUIRES: MongoDB Replica Set (will fail on standalone)
 */
@Configuration
public class MongoConfig {

    /**
     * Enable @Transactional support for MongoDB
     *
     * Usage:
     * @Transactional
     * public void transferFunds(...) {
     *     // Multiple document updates here
     *     // All succeed or all rollback
     * }
     *
     * Note: Only works with Replica Set, not standalone MongoDB
     */
    @Bean
    MongoTransactionManager transactionManager(MongoDatabaseFactory dbFactory) {
        return new MongoTransactionManager(dbFactory);
    }
}
