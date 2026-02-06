package com.example.mongopractice.document;

import lombok.Builder;
import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * User Document - Hybrid Pattern
 *
 * Embedded: passkeys (bounded, max 10), settings (1:1 relationship)
 * Referenced: transactions (unbounded, millions possible)
 *
 * SQL equivalent would need 3 tables: users, user_passkeys, user_settings
 * MongoDB: 1 document với embedded sub-documents
 */
@Data
@Builder
@Document(collection = "users")
public class User {

    @Id
    private ObjectId id;

    @Indexed(unique = true)
    @Field("publicKey")
    private String publicKey; // Ethereum address: 0x...

    private String displayName;

    /**
     * EMBEDDED PATTERN: Passkeys are bounded (max 10 devices per user)
     * - Always read together with user
     * - Lifecycle tied to user
     * - No need for separate queries
     */
    @Builder.Default
    private List<Passkey> passkeys = new ArrayList<>();

    /**
     * EMBEDDED PATTERN: Settings is 1:1 with user
     * - Single sub-document, not array
     * - Always read/updated together
     */
    @Builder.Default
    private UserSettings settings = new UserSettings();

    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    public static class Passkey {
        private String credentialId;
        private String publicKey;
        private String deviceName;
        private Instant createdAt;
        private Instant lastUsedAt;
    }

    @Data
    @Builder
    public static class UserSettings {
        @Builder.Default
        private boolean notificationsEnabled = true;
        @Builder.Default
        private Network defaultNetwork = Network.ethereum;

        public UserSettings() {
            this.notificationsEnabled = true;
            this.defaultNetwork = Network.ethereum;
        }

        public UserSettings(boolean notificationsEnabled, Network defaultNetwork) {
            this.notificationsEnabled = notificationsEnabled;
            this.defaultNetwork = defaultNetwork;
        }
    }
}
