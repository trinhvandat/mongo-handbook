package com.example.mongopractice.service;

import com.example.mongopractice.document.User;
import com.example.mongopractice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    public User createUser(String publicKey, String displayName) {
        var user = User.builder()
            .publicKey(publicKey)
            .displayName(displayName)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        return userRepository.save(user);
    }

    public Optional<User> findByPublicKey(String publicKey) {
        return userRepository.findByPublicKey(publicKey);
    }

    /**
     * Add passkey to user - Atomic array push
     *
     * SQL would need: INSERT INTO passkeys (user_id, ...) VALUES (?, ...)
     * MongoDB: Atomic update, no race conditions
     */
    public User addPasskey(String publicKey, User.Passkey passkey) {
        var query = Query.query(Criteria.where("publicKey").is(publicKey));

        var update = new Update()
            .push("passkeys", passkey)
            .set("updatedAt", Instant.now());

        // findAndModify returns updated document
        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions.options().returnNew(true),
            User.class
        );
    }

    /**
     * Remove passkey - Atomic array pull
     *
     * SQL: DELETE FROM passkeys WHERE user_id = ? AND credential_id = ?
     * MongoDB: Single atomic operation
     */
    public User removePasskey(String publicKey, String credentialId) {
        var query = Query.query(Criteria.where("publicKey").is(publicKey));

        var update = new Update()
            .pull("passkeys", Query.query(Criteria.where("credentialId").is(credentialId)))
            .set("updatedAt", Instant.now());

        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions.options().returnNew(true),
            User.class
        );
    }

    /**
     * Update specific passkey in array - Positional operator $
     *
     * SQL: UPDATE passkeys SET last_used_at = ? WHERE credential_id = ?
     * MongoDB: Update in-place within array
     */
    public void updatePasskeyLastUsed(String publicKey, String credentialId) {
        var query = Query.query(
            Criteria.where("publicKey").is(publicKey)
                   .and("passkeys.credentialId").is(credentialId)
        );

        // $ = positional operator, refers to matched array element
        var update = new Update()
            .set("passkeys.$.lastUsedAt", Instant.now())
            .set("updatedAt", Instant.now());

        mongoTemplate.updateFirst(query, update, User.class);
    }

    /**
     * Update user settings - Nested document update
     */
    public User updateSettings(String publicKey, User.UserSettings settings) {
        var query = Query.query(Criteria.where("publicKey").is(publicKey));

        var update = new Update()
            .set("settings", settings)
            .set("updatedAt", Instant.now());

        return mongoTemplate.findAndModify(
            query,
            update,
            FindAndModifyOptions.options().returnNew(true),
            User.class
        );
    }
}
