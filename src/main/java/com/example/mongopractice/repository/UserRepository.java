package com.example.mongopractice.repository;

import com.example.mongopractice.document.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.Instant;
import java.util.Optional;

/**
 * UserRepository - Basic CRUD + Custom Queries
 *
 * Spring Data MongoDB tự động generate implementation từ method name
 * Tương tự JPA nhưng query language là MongoDB Query
 */
public interface UserRepository extends MongoRepository<User, ObjectId> {

    /**
     * Find by indexed field - O(log n) với B-tree index
     * SQL: SELECT * FROM users WHERE public_key = ?
     */
    Optional<User> findByPublicKey(String publicKey);

    /**
     * Query embedded array - tìm user có passkey cụ thể
     * SQL would need JOIN: SELECT u.* FROM users u JOIN passkeys p ON u.id = p.user_id WHERE p.credential_id = ?
     * MongoDB: Single document scan với index on 'passkeys.credentialId'
     */
    @Query("{ 'passkeys.credentialId': ?0 }")
    Optional<User> findByPasskeyCredentialId(String credentialId);

    /**
     * Atomic update embedded document
     * SQL: UPDATE passkeys SET last_used_at = ? WHERE credential_id = ?
     * MongoDB: Update in-place, no separate query needed
     *
     * $[elem] is positional filtered update (MongoDB 3.6+)
     */
    @Query("{ 'passkeys.credentialId': ?0 }")
    @Update("{ '$set': { 'passkeys.$[elem].lastUsedAt': ?1 }, '$currentDate': { 'updatedAt': true } }")
    void updatePasskeyLastUsed(String credentialId, Instant lastUsedAt);

    /**
     * Projection - only fetch specific fields (reduce network IO)
     * SQL: SELECT public_key, display_name FROM users WHERE public_key = ?
     */
    @Query(value = "{ 'publicKey': ?0 }", fields = "{ 'publicKey': 1, 'displayName': 1 }")
    Optional<User> findPublicInfoByPublicKey(String publicKey);
}
