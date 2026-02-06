// Switch to wallet_db
db = db.getSiblingDB('wallet_db');

// Create application user
db.createUser({
  user: 'wallet_app',
  pwd: 'wallet_secret',
  roles: [{ role: 'readWrite', db: 'wallet_db' }]
});

// Create collections with schema validation (MongoDB 7.0 feature)
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['publicKey', 'createdAt'],
      properties: {
        publicKey: {
          bsonType: 'string',
          pattern: '^0x[a-fA-F0-9]{40}$',
          description: 'Ethereum wallet address'
        },
        displayName: { bsonType: 'string', maxLength: 50 },
        passkeys: {
          bsonType: 'array',
          maxItems: 10,
          items: {
            bsonType: 'object',
            required: ['credentialId', 'publicKey', 'createdAt'],
            properties: {
              credentialId: { bsonType: 'string' },
              publicKey: { bsonType: 'string' },
              deviceName: { bsonType: 'string' },
              createdAt: { bsonType: 'date' },
              lastUsedAt: { bsonType: 'date' }
            }
          }
        },
        settings: {
          bsonType: 'object',
          properties: {
            notificationsEnabled: { bsonType: 'bool' },
            defaultNetwork: { enum: ['ethereum', 'polygon', 'arbitrum', 'optimism'] }
          }
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('transactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'txHash', 'network', 'type', 'status', 'createdAt'],
      properties: {
        userId: { bsonType: 'objectId' },
        txHash: {
          bsonType: 'string',
          pattern: '^0x[a-fA-F0-9]{64}$'
        },
        network: { enum: ['ethereum', 'polygon', 'arbitrum', 'optimism'] },
        type: { enum: ['send', 'receive', 'swap', 'approve', 'mint', 'bridge'] },
        status: { enum: ['pending', 'confirmed', 'failed'] },
        from: { bsonType: 'string' },
        to: { bsonType: 'string' },
        value: { bsonType: 'decimal' },
        gasUsed: { bsonType: 'long' },
        gasPrice: { bsonType: 'decimal' },
        blockNumber: { bsonType: 'long' },
        metadata: {
          bsonType: 'object',
          properties: {
            tokenSymbol: { bsonType: 'string' },
            tokenAddress: { bsonType: 'string' },
            nftTokenId: { bsonType: 'string' }
          }
        },
        createdAt: { bsonType: 'date' },
        confirmedAt: { bsonType: 'date' }
      }
    }
  }
});

// Indexes - Critical for performance
// Users collection
db.users.createIndex({ publicKey: 1 }, { unique: true });
db.users.createIndex({ 'passkeys.credentialId': 1 });

// Transactions collection - Compound indexes for common queries
db.transactions.createIndex({ userId: 1, createdAt: -1 }); // User's tx history
db.transactions.createIndex({ txHash: 1 }, { unique: true }); // Lookup by hash
db.transactions.createIndex({ userId: 1, status: 1, createdAt: -1 }); // Filter by status
db.transactions.createIndex({ userId: 1, network: 1, type: 1, createdAt: -1 }); // Complex filters

// MongoDB 7.0: Compound Wildcard Index for flexible metadata queries
db.transactions.createIndex(
  { userId: 1, 'metadata.$**': 1 },
  { name: 'idx_user_metadata_wildcard' }
);

print('✅ wallet_db initialized with collections and indexes');
