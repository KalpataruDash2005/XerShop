DELETE FROM coupons WHERE code IN ('WELCOME20', 'FLAT50');

INSERT INTO coupons (code, description, type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, is_platform_wide, shop_id, valid_from, valid_until, created_at, updated_at) VALUES
('WELCOME20', '20% off on your first order', 'PERCENTAGE', 20.00, 100.00, 100.00, 10000, TRUE, TRUE, NULL, NOW(), DATEADD('YEAR', 1, NOW()), NOW(), NOW()),
('FLAT50', 'Flat Rs.50 off on orders above Rs.200', 'FIXED', 50.00, 200.00, 50.00, 5000, TRUE, TRUE, NULL, NOW(), DATEADD('MONTH', 6, NOW()), NOW(), NOW());
