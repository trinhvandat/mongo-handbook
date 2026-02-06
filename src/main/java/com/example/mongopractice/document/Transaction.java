package com.example.mongopractice.document;

import lombok.Builder;
import lombok.Data;
import org.bson.types.Decimal128;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Transaction Document - Reference Pattern
 *
 * WHY NOT EMBED in User?
 * 1. Document size limit: 16MB (1 tx ~500 bytes = max 32K txs)
 * 2. Write amplification: Adding 1 tx rewrites entire user document
 * 3. Query flexibility: Often need to query txs across users (admin dashboards)
 *
 * REFERENCE via userId → User._id (like SQL foreign key, but NO automatic enforcement)
 *
 * Performance note:
 * - Index on {userId, createdAt: -1} covers 90% of queries
 * - Compound index order matters! userId first because equality, then createdAt for range
 */
@Data
@Builder
@Document(collection = "transactions")
@CompoundIndexes({
    @CompoundIndex(name = "idx_user_created", def = "{'userId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_user_status_created", def = "{'userId': 1, 'status': 1, 'createdAt': -1}")
})
public class Transaction {

    @Id
    private ObjectId id;

    /**
     * Reference to User document
     * SQL equivalent: FOREIGN KEY (user_id) REFERENCES users(id)
     * MongoDB: No automatic enforcement, application must maintain integrity
     */
    @Indexed
    private ObjectId userId;

    @Indexed(unique = true)
    private String txHash; // 0x... (64 hex chars)

    private Network network;
    private TransactionType type;
    private TransactionStatus status;

    private String from;
    private String to;

    /**
     * Use Decimal128 for financial amounts - prevents floating point errors
     * SQL equivalent: DECIMAL(38, 18)
     */
    private Decimal128 value;
    private Long gasUsed;
    private Decimal128 gasPrice;
    private Long blockNumber;

    /**
     * Flexible metadata - different tx types have different metadata
     * This is where MongoDB shines vs SQL (no ALTER TABLE needed)
     */
    private TransactionMetadata metadata;

    private Instant createdAt;
    private Instant confirmedAt;

    @Data
    @Builder
    public static class TransactionMetadata {
        private String tokenSymbol;    // For ERC20 transfers
        private String tokenAddress;   // Contract address
        private String nftTokenId;     // For ERC721 transfers
        private String swapFromToken;  // For swaps
        private String swapToToken;
    }

    public enum TransactionType {
        send, receive, swap, approve, mint, bridge
    }

    public enum TransactionStatus {
        pending, confirmed, failed
    }
}
