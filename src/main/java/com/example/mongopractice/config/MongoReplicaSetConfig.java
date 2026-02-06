package com.example.mongopractice.config;

import com.mongodb.ReadPreference;
import com.mongodb.WriteConcern;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.WriteResultChecking;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

import java.time.Duration;

/**
 * MongoDB Replica Set Configuration
 *
 * Connection string example:
 * mongodb://host1:27017,host2:27017,host3:27017/wallet_db?replicaSet=rs0
 */
@Configuration
public class MongoReplicaSetConfig {

    /**
     * Custom MongoTemplate với Write Concern cho financial data
     */
    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory factory,
                                       MappingMongoConverter converter) {
        var template = new MongoTemplate(factory, converter);

        // Throw exception nếu write fail
        template.setWriteResultChecking(WriteResultChecking.EXCEPTION);

        return template;
    }

    /**
     * Write Concerns cho các use cases khác nhau
     */
    public static class WriteConcerns {

        /**
         * Cho transactions/transfers - PHẢI dùng majority
         * Đợi đa số servers confirm + ghi xuống journal
         */
        public static final WriteConcern FINANCIAL = WriteConcern.MAJORITY
            .withJournal(true)
            .withWTimeout(Duration.ofSeconds(5));

        /**
         * Cho data quan trọng nhưng không critical
         */
        public static final WriteConcern IMPORTANT = WriteConcern.W1
            .withJournal(true);

        /**
         * Cho logs, metrics - tốc độ quan trọng hơn durability
         */
        public static final WriteConcern LOGS = WriteConcern.W1
            .withJournal(false);

        /**
         * Fire and forget - chỉ dùng khi chấp nhận mất data
         */
        public static final WriteConcern FIRE_AND_FORGET = WriteConcern.UNACKNOWLEDGED;
    }

    /**
     * Read Preferences cho các use cases khác nhau
     */
    public static class ReadPreferences {

        /**
         * Cho data cần consistent (balance check, etc.)
         */
        public static final ReadPreference CONSISTENT = ReadPreference.primary();

        /**
         * Cho analytics, reports - có thể chấp nhận stale data
         */
        public static final ReadPreference ANALYTICS = ReadPreference.secondaryPreferred();

        /**
         * Cho global users - đọc từ server gần nhất
         */
        public static final ReadPreference NEAREST = ReadPreference.nearest();
    }
}
