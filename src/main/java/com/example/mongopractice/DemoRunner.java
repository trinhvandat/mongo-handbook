package com.example.mongopractice;

import com.example.mongopractice.document.Network;
import com.example.mongopractice.document.Transaction.TransactionType;
import com.example.mongopractice.document.User;
import com.example.mongopractice.service.TransactionService;
import com.example.mongopractice.service.UserService;
import com.example.mongopractice.service.WalletQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class DemoRunner implements CommandLineRunner {

    private final UserService userService;
    private final TransactionService transactionService;
    private final WalletQueryService walletQueryService;

    @Override
    public void run(String... args) {
        log.info("=== MongoDB Wallet Demo ===");

        // 1. Create user
        log.info("\n--- 1. Create User ---");
        var user = userService.createUser(
            "0x742d35Cc6634C0532925a3b844Bc9e7595f8dB22",
            "CryptoWhale"
        );
        log.info("Created user: {}", user);

        // 2. Add passkeys (embedded document)
        log.info("\n--- 2. Add Passkeys (Embedded) ---");
        var passkey1 = User.Passkey.builder()
            .credentialId("cred_abc123")
            .publicKey("pk_xyz789")
            .deviceName("iPhone 15 Pro")
            .createdAt(Instant.now())
            .build();

        user = userService.addPasskey(user.getPublicKey(), passkey1);
        log.info("Added passkey. User now has {} passkeys", user.getPasskeys().size());

        // 3. Create transactions (referenced documents)
        log.info("\n--- 3. Create Transactions (Referenced) ---");
        for (int i = 0; i < 5; i++) {
            var tx = transactionService.createTransaction(
                user.getId(),
                String.format("0x%064x", i + 1), // Fake tx hash
                Network.ethereum,
                i % 2 == 0 ? TransactionType.send : TransactionType.receive,
                user.getPublicKey(),
                "0x" + "a".repeat(40),
                new BigDecimal("0." + (i + 1))
            );
            log.info("Created tx: {} - {} ETH", tx.getTxHash().substring(0, 10) + "...", tx.getValue());
        }

        // 4. Query transactions with pagination
        log.info("\n--- 4. Query with Pagination ---");
        var txPage = transactionService.getUserTransactions(user.getId(), 0, 3);
        log.info("Page 1 of {}: {} transactions", txPage.getTotalPages(), txPage.getContent().size());

        // 5. Confirm a transaction
        log.info("\n--- 5. Confirm Transaction ---");
        var confirmed = transactionService.confirmTransaction(
            String.format("0x%064x", 1),
            18500000L,
            21000L,
            new BigDecimal("30.5")
        );
        log.info("Transaction confirmed: {}", confirmed);

        // 6. Get transaction summary (Aggregation)
        log.info("\n--- 6. Aggregation: Transaction Summary ---");
        var summary = transactionService.getTransactionSummary(
            user.getId(),
            Instant.now().minus(1, ChronoUnit.DAYS)
        );
        summary.forEach(s -> log.info("Type: {}, Count: {}, Total: {}",
            s.getType(), s.getCount(), s.getTotalValue()));

        // 7. $lookup example
        log.info("\n--- 7. $lookup: User with Transactions ---");
        var userWithTxs = walletQueryService.getUserWithRecentTransactions(
            user.getPublicKey(), 3
        );
        if (userWithTxs != null) {
            log.info("User {} has {} recent transactions",
                userWithTxs.getDisplayName(),
                userWithTxs.getRecentTransactions() != null
                    ? userWithTxs.getRecentTransactions().size()
                    : 0
            );
        }

        log.info("\n=== Demo Complete ===");
    }
}
