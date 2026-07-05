-- Flyway Migration V3
-- Add UTR and screenshot_path columns to payments table
ALTER TABLE payments ADD COLUMN utr VARCHAR(100);
ALTER TABLE payments ADD COLUMN screenshot_path VARCHAR(500);
