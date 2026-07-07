DELETE FROM order_timeline;
DELETE FROM order_items;
DELETE FROM payments;
DELETE FROM wallet_transactions;
DELETE FROM reviews;
DELETE FROM employees;
DELETE FROM notifications;
DELETE FROM refresh_tokens;
DELETE FROM referrals;
DELETE FROM audit_logs;
DELETE FROM orders;
DELETE FROM addresses;
DELETE FROM printers;
DELETE FROM inventory;
DELETE FROM pricing_rules;
DELETE FROM coupons;
DELETE FROM wallets;
DELETE FROM shops;
DELETE FROM users;

ALTER TABLE users ALTER COLUMN id RESTART WITH 1;
ALTER TABLE shops ALTER COLUMN id RESTART WITH 1;
ALTER TABLE printers ALTER COLUMN id RESTART WITH 1;
ALTER TABLE pricing_rules ALTER COLUMN id RESTART WITH 1;

INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at) VALUES
('Aditya', 'aditya.bajoria0208@gmail.com', '+918777815510', '$2b$12$UItv8uazESuX8fetBIcU7eUghoS2sUXCLZ1ad8G3Hn3lWRzDQWwEy', 'ADMIN', TRUE, NOW(), NOW()),
('Kalpataru', 'kalpataru05aug@gmail.com', '+919146922610', '$2b$12$.sVy3Ui/j9S8wH32ZXTXoe2/eVA1s3KLdBFW.caYPP4JtS4KRGGka', 'ADMIN', TRUE, NOW(), NOW()),
('Jainish', 'jainishbaria42@gmail.com', '+917203971530', '$2b$12$SEivV5MEsY/J/Fuu39.fquPRy5wnEK5qliBmhj1.kpo3/SrUMKK9a', 'ADMIN', TRUE, NOW(), NOW());

INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at) VALUES
('Demo Shop', 'shop@demo.com', '+919999999991', '$2b$12$3OPUFFOxx8Rw7RXmwDsUM.X7ZHJjrag34odutGlpzp5MEp.JbXVha', 'SHOP_OWNER', TRUE, NOW(), NOW());

INSERT INTO shops (owner_id, name, description, gst_number, phone, email, address, city, state, pincode, latitude, longitude, status, commission_percent, rating_avg, total_reviews, is_accepting_orders, created_at, updated_at) VALUES
(4, 'Demo Print Shop', 'Default printing shop', '27AAAAA1111A1Z1', '+919999999991', 'shop@demo.com', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 19.0760, 72.8777, 'APPROVED', 0.00, 5.00, 1, TRUE, NOW(), NOW());

INSERT INTO printers (shop_id, name, model, type, status, max_paper_size, supports_color, supports_duplex, max_gsm, prints_per_minute, total_prints, created_at, updated_at) VALUES
(1, 'Primary Laser Printer', 'Canon imageRUNNER 2206', 'LASER', 'ACTIVE', 'A4', TRUE, TRUE, 120, 22, 0, NOW(), NOW());

INSERT INTO pricing_rules (shop_id, paper_size, gsm, color_mode, sides, binding, base_price, price_per_page, price_per_copy, lamination_price, binding_price, min_pages, is_active, created_at, updated_at) VALUES
(1, 'A4', 75, 'BW', 'SINGLE', 'NONE', 10.00, 2.00, 2.00, 10.00, 0.00, 1, TRUE, NOW(), NOW()),
(1, 'A4', 75, 'BW', 'DOUBLE', 'NONE', 15.00, 1.50, 1.50, 10.00, 0.00, 1, TRUE, NOW(), NOW()),
(1, 'A4', 75, 'COLOR', 'SINGLE', 'NONE', 20.00, 5.00, 5.00, 5.00, 0.00, 1, TRUE, NOW(), NOW()),
(1, 'A4', 75, 'COLOR', 'DOUBLE', 'NONE', 30.00, 4.00, 4.00, 5.00, 0.00, 1, TRUE, NOW(), NOW());

INSERT INTO coupons (code, description, type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, is_platform_wide, shop_id, valid_from, valid_until, created_at, updated_at) VALUES
('WELCOME20', '20% off on your first order', 'PERCENTAGE', 20.00, 100.00, 100.00, 10000, TRUE, TRUE, NULL, NOW(), DATEADD('YEAR', 1, NOW()), NOW(), NOW()),
('FLAT50', 'Flat Rs.50 off on orders above Rs.200', 'FIXED', 50.00, 200.00, 50.00, 5000, TRUE, TRUE, NULL, NOW(), DATEADD('MONTH', 6, NOW()), NOW(), NOW());
