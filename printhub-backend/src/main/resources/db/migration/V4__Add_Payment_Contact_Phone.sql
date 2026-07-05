-- Flyway Migration V4
-- Add contact_phone column to payments table for admin verification callback
ALTER TABLE payments ADD COLUMN contact_phone VARCHAR(15);
