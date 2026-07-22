-- Change FLAT50 from fixed Rs.50 to 50% off on printing cost
UPDATE coupons SET type = 'PERCENTAGE', discount_value = 50.00, description = '50% off on printing cost', max_discount_amount = NULL, min_order_amount = 50.00, updated_at = NOW()
WHERE code = 'FLAT50';
