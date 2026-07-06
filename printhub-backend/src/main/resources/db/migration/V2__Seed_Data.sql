-- Printhub Seed Data
-- Flyway Migration V2

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
INSERT INTO coupons (code, description, type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, is_platform_wide, shop_id, valid_from, valid_until, created_at, updated_at) VALUES
('WELCOME20', '20% off on your first order', 'PERCENTAGE', 20.00, 100.00, 100.00, 10000, TRUE, TRUE, NULL, NOW(), DATEADD('YEAR', 1, NOW()), NOW(), NOW()),
('FLAT50', 'Flat Rs.50 off on orders above Rs.200', 'FIXED', 50.00, 200.00, 50.00, 5000, TRUE, TRUE, NULL, NOW(), DATEADD('MONTH', 6, NOW()), NOW(), NOW());

-- Insert Admin User (password: admin123 - BCrypt hashed)
INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at) VALUES
('System Admin', 'admin@printhub.com', '+910000000000', '$2a$12$OMEumqN8S9lzLcp5eXbrZe1SYreH3qNw1pFavEfS6HH7M3uJhr.Ka', 'ADMIN', TRUE, NOW(), NOW());

-- Insert Demo Shop Owner (password: admin123 - BCrypt hashed)
INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at) VALUES
('Demo Shop', 'shop@demo.com', '+919999999991', '$2a$12$OMEumqN8S9lzLcp5eXbrZe1SYreH3qNw1pFavEfS6HH7M3uJhr.Ka', 'SHOP_OWNER', TRUE, NOW(), NOW());

-- Insert Default Shop for the Demo Owner (owner_id = 2, status = APPROVED)
INSERT INTO shops (owner_id, name, description, gst_number, phone, email, address, city, state, pincode, latitude, longitude, status, commission_percent, rating_avg, total_reviews, is_accepting_orders, created_at, updated_at) VALUES
(2, 'Demo Print Shop', 'Default printing shop', '27AAAAA1111A1Z1', '+919999999991', 'shop@demo.com', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 19.0760, 72.8777, 'APPROVED', 0.00, 5.00, 1, TRUE, NOW(), NOW());

-- Insert Default Printer for Demo Shop
INSERT INTO printers (shop_id, name, model, type, status, max_paper_size, supports_color, supports_duplex, max_gsm, prints_per_minute, total_prints, created_at, updated_at) VALUES
(1, 'Primary Laser Printer', 'Canon imageRUNNER 2206', 'LASER', 'ACTIVE', 'A4', TRUE, TRUE, 120, 22, 0, NOW(), NOW());

-- Insert Default Pricing Rules for Demo Shop
INSERT INTO pricing_rules (shop_id, paper_size, gsm, color_mode, sides, binding, base_price, price_per_page, price_per_copy, lamination_price, binding_price, min_pages, is_active, created_at, updated_at) VALUES
(1, 'A4', 75, 'BW', 'SINGLE', 'NONE', 10.00, 2.00, 2.00, 10.00, 0.00, 1, TRUE, NOW(), NOW()),
(1, 'A4', 75, 'BW', 'DOUBLE', 'NONE', 15.00, 1.50, 1.50, 10.00, 0.00, 1, TRUE, NOW(), NOW()),
(1, 'A4', 75, 'COLOR', 'SINGLE', 'NONE', 20.00, 10.00, 10.00, 10.00, 0.00, 1, TRUE, NOW(), NOW()),
(1, 'A4', 75, 'COLOR', 'DOUBLE', 'NONE', 30.00, 8.00, 8.00, 10.00, 0.00, 1, TRUE, NOW(), NOW());

-- (Demo customer, orders, payments removed)

