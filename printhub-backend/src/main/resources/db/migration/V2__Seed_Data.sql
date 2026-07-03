-- Printhub Seed Data - Phase 2
-- Flyway Migration V2
-- ===================================

-- Insert Admin User (password: admin123 - BCrypt hashed)
INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at) VALUES
('System Admin', 'admin@printhub.com', '+919999999999', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.Vz5WZ9GY9J6X2W', 'ADMIN', TRUE, NOW(), NOW());

-- Insert Platform Settings
INSERT INTO platform_settings (setting_key, setting_value, description) VALUES
('platform_commission_percent', '15.00', 'Default platform commission percentage on orders'),
('min_order_amount', '10.00', 'Minimum order amount in INR'),
('delivery_charge_base', '30.00', 'Base delivery charge'),
('delivery_charge_per_km', '5.00', 'Additional delivery charge per km'),
('referral_bonus_amount', '50.00', 'Referral bonus amount for both referrer and referred'),
('gst_percent', '18.00', 'GST percentage for invoices'),
('order_sla_minutes', '30', 'SLA in minutes for order acceptance'),
('max_file_size_mb', '50', 'Maximum upload file size in MB'),
('supported_file_types', 'pdf,doc,docx,ppt,pptx,jpg,jpeg,png,zip', 'Supported file types for upload'),
('auto_delete_files_days', '7', 'Days after order completion to delete uploaded files');

-- Insert Default Categories
INSERT INTO categories (name, slug, description, display_order, is_active, created_at, updated_at) VALUES
('Documents', 'documents', 'Print documents, reports, and presentations', 1, TRUE, NOW(), NOW()),
('Photos', 'photos', 'Photo prints in various sizes', 2, TRUE, NOW(), NOW()),
('Posters', 'posters', 'Posters and banners', 3, TRUE, NOW(), NOW()),
('Business Cards', 'business-cards', 'Professional business cards', 4, TRUE, NOW(), NOW()),
('Brochures', 'brochures', 'Marketing brochures and flyers', 5, TRUE, NOW(), NOW()),
('Books', 'books', 'Book printing and binding', 6, TRUE, NOW(), NOW());

-- Insert Sample CMS Pages
INSERT INTO cms_pages (slug, title, content, is_published, published_at, created_at, updated_at) VALUES
('about', 'About PrintHub', '<h1>About PrintHub</h1><p>PrintHub is your trusted on-demand printing marketplace, connecting customers with nearby print shops for fast, reliable service.</p><p>Print Anything. Anywhere. Anytime.</p>', TRUE, NOW(), NOW(), NOW()),
('terms', 'Terms of Service', '<h1>Terms of Service</h1><p>By using PrintHub, you agree to these terms...</p>', TRUE, NOW(), NOW(), NOW()),
('privacy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>We respect your privacy and protect your personal information...</p>', TRUE, NOW(), NOW(), NOW()),
('faq', 'Frequently Asked Questions', '<h1>FAQs</h1><h2>How do I place an order?</h2><p>Simply upload your document, configure print options, and checkout.</p>', TRUE, NOW(), NOW(), NOW());

-- Insert Welcome Banner
INSERT INTO cms_banners (title, image_url, link_url, position, is_active, created_at, updated_at) VALUES
('Welcome to PrintHub', 'https://placehold.co/1200x400/2F6FED/FFFFFF?text=PrintHub', '/upload', 1, TRUE, NOW(), NOW()),
('Get 20% off on first order', 'https://placehold.co/1200x400/22D3EE/1A2740?text=20%25+OFF+First+Order', '/coupons', 2, TRUE, NOW(), NOW());

-- Insert Sample Coupon
INSERT INTO coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, is_active, is_platform_wide, shop_id, valid_from, valid_until, created_at, updated_at) VALUES
('WELCOME20', '20% off on your first order', 'PERCENTAGE', 20.00, 100.00, 100.00, 10000, TRUE, TRUE, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), NOW(), NOW()),
('FLAT50', 'Flat Rs.50 off on orders above Rs.200', 'FIXED', 50.00, 200.00, 50.00, 5000, TRUE, TRUE, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), NOW(), NOW());

-- Create Fulltext index for shop search (if not exists)
-- ALTER TABLE shops ADD FULLTEXT INDEX ft_shops_search (name, description, city);

-- Update shop ratings trigger (to auto-calculate average rating)
DELIMITER //
CREATE TRIGGER update_shop_rating AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE shops
    SET rating_avg = (
        SELECT AVG(rating) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE AND deleted_at IS NULL
    ),
    total_reviews = (
        SELECT COUNT(*) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE AND deleted_at IS NULL
    )
    WHERE id = NEW.shop_id;
END//
CREATE TRIGGER update_shop_rating_update AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE shops
    SET rating_avg = (
        SELECT AVG(rating) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE AND deleted_at IS NULL
    ),
    total_reviews = (
        SELECT COUNT(*) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE AND deleted_at IS NULL
    )
    WHERE id = NEW.shop_id;
END//
CREATE TRIGGER update_shop_rating_delete AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE shops
    SET rating_avg = COALESCE((
        SELECT AVG(rating) FROM reviews WHERE shop_id = OLD.shop_id AND is_visible = TRUE AND deleted_at IS NULL
    ), 0),
    total_reviews = COALESCE((
        SELECT COUNT(*) FROM reviews WHERE shop_id = OLD.shop_id AND is_visible = TRUE AND deleted_at IS NULL
    ), 0)
    WHERE id = OLD.shop_id;
END//
DELIMITER ;

-- Trigger for inventory low stock update
DELIMITER //
CREATE TRIGGER check_low_stock AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
    IF NEW.quantity < COALESCE(NEW.low_stock_threshold, 0) THEN
        UPDATE inventory SET is_low_stock = TRUE WHERE id = NEW.id;
    ELSE
        UPDATE inventory SET is_low_stock = FALSE WHERE id = NEW.id;
    END IF;
END//
DELIMITER ;
