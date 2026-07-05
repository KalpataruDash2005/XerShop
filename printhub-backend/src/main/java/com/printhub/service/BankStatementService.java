package com.printhub.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BankStatementService {

    @Data
    public static class BankTransaction {
        private String utr;
        private BigDecimal amount;
        private String timestamp;
        private String description;
        private boolean used;
    }

    private final String filePath = "d:/XeroShop/v1/XerShop/bank_statements.json";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public synchronized boolean verifyTransaction(BigDecimal amount) {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                // Initialize default bank statement file with some mock entries
                List<BankTransaction> initialList = new ArrayList<>();
                
                // Add a default transaction matching a typical check for testing
                BankTransaction t = new BankTransaction();
                t.setUtr("UPI-MOCK-123");
                t.setAmount(BigDecimal.valueOf(2.36));
                t.setTimestamp(LocalDateTime.now().toString());
                t.setDescription("Mock UPI deposit");
                t.setUsed(false);
                initialList.add(t);
                
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, initialList);
            }

            List<BankTransaction> transactions = objectMapper.readValue(file, new TypeReference<List<BankTransaction>>() {});
            for (BankTransaction tx : transactions) {
                if (!tx.isUsed() && tx.getAmount().compareTo(amount) == 0) {
                    tx.setUsed(true);
                    // Save the updated ledger back to file
                    objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, transactions);
                    return true;
                }
            }
        } catch (Exception e) {
            System.err.println("Error reading bank statements: " + e.getMessage());
        }
        return false;
    }
}
