ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway VARCHAR(30) DEFAULT 'RAZORPAY';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS pre_order_data TEXT;
ALTER TABLE payments ALTER COLUMN order_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON payments(razorpay_order_id);
