-- Seed Data
-- This runs after V1 which is baselined. Tables already exist via ddl-auto.
-- Uses WHERE NOT EXISTS to handle both email AND phone unique constraints safely.

-- Admin users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'aditya.bajoria0208@gmail.com' OR phone = '+918777815510') THEN
        INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at)
        VALUES ('Aditya', 'aditya.bajoria0208@gmail.com', '+918777815510', '$2b$12$UItv8uazESuX8fetBIcU7eUghoS2sUXCLZ1ad8G3Hn3lWRzDQWwEy', 'ADMIN', TRUE, NOW(), NOW());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kalpataru05aug@gmail.com' OR phone = '+919146922610') THEN
        INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at)
        VALUES ('Kalpataru', 'kalpataru05aug@gmail.com', '+919146922610', '$2b$12$.sVy3Ui/j9S8wH32ZXTXoe2/eVA1s3KLdBFW.caYPP4JtS4KRGGka', 'ADMIN', TRUE, NOW(), NOW());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'jainishbaria42@gmail.com' OR phone = '+917203971530') THEN
        INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at)
        VALUES ('Jainish', 'jainishbaria42@gmail.com', '+917203971530', '$2b$12$SEivV5MEsY/J/Fuu39.fquPRy5wnEK5qliBmhj1.kpo3/SrUMKK9a', 'ADMIN', TRUE, NOW(), NOW());
    END IF;
END $$;

DO $$
DECLARE
    shop_owner_id BIGINT;
BEGIN
    -- Create or find the demo shop owner
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'shop@demo.com' OR phone = '+919999999991') THEN
        INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at)
        VALUES ('Demo Shop', 'shop@demo.com', '+919999999991', '$2b$12$3OPUFFOxx8Rw7RXmwDsUM.X7ZHJjrag34odutGlpzp5MEp.JbXVha', 'SHOP_OWNER', TRUE, NOW(), NOW())
        RETURNING id INTO shop_owner_id;
    ELSE
        SELECT id INTO shop_owner_id FROM users WHERE email = 'shop@demo.com' OR phone = '+919999999991' LIMIT 1;
    END IF;

    -- Create shop if not exists
    IF NOT EXISTS (SELECT 1 FROM shops WHERE email = 'shop@demo.com' OR phone = '+919999999991') THEN
        INSERT INTO shops (owner_id, name, description, gst_number, phone, email, address, city, state, pincode, latitude, longitude, status, commission_percent, rating_avg, total_reviews, is_accepting_orders, created_at, updated_at)
        VALUES (shop_owner_id, 'Demo Print Shop', 'Default printing shop', '27AAAAA1111A1Z1', '+919999999991', 'shop@demo.com', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 19.0760, 72.8777, 'APPROVED', 0.00, 5.00, 1, TRUE, NOW(), NOW());
    END IF;

    -- Create printer if not exists (for the demo shop)
    IF NOT EXISTS (SELECT 1 FROM printers p JOIN shops s ON p.shop_id = s.id WHERE s.name = 'Demo Print Shop') THEN
        INSERT INTO printers (shop_id, name, model, type, status, max_paper_size, supports_color, supports_duplex, max_gsm, prints_per_minute, total_prints, created_at, updated_at)
        SELECT id, 'Primary Laser Printer', 'Canon imageRUNNER 2206', 'LASER_COLOR', 'ACTIVE', 'A4', TRUE, TRUE, 120, 22, 0, NOW(), NOW()
        FROM shops WHERE name = 'Demo Print Shop';
    END IF;
END $$;

-- Pricing rules (idempotent)
INSERT INTO pricing_rules (shop_id, paper_size, gsm, color_mode, sides, binding, base_price, price_per_page, price_per_copy, lamination_price, binding_price, min_pages, is_active, created_at, updated_at)
SELECT s.id, p.*, TRUE, NOW(), NOW() FROM shops s CROSS JOIN (VALUES
    ('A4', 75, 'BW', 'SINGLE', 'NONE', 10.00, 2.00, 2.00, 10.00, 0.00, 1),
    ('A4', 75, 'BW', 'DOUBLE', 'NONE', 15.00, 1.50, 1.50, 10.00, 0.00, 1),
    ('A4', 75, 'COLOR', 'SINGLE', 'NONE', 20.00, 5.00, 5.00, 5.00, 0.00, 1),
    ('A4', 75, 'COLOR', 'DOUBLE', 'NONE', 30.00, 4.00, 4.00, 5.00, 0.00, 1)
) AS p(paper_size, gsm, color_mode, sides, binding, base_price, price_per_page, price_per_copy, lamination_price, binding_price, min_pages)
WHERE s.name = 'Demo Print Shop' AND NOT EXISTS (SELECT 1 FROM pricing_rules pr WHERE pr.shop_id = s.id LIMIT 1);

-- Platform settings
INSERT INTO platform_settings (setting_key, setting_value, description, created_at, updated_at) VALUES
('platform_commission_percent', '15.00', 'Default platform commission percentage on orders', NOW(), NOW()),
('min_order_amount', '10.00', 'Minimum order amount in INR', NOW(), NOW()),
('delivery_charge_base', '30.00', 'Base delivery charge', NOW(), NOW()),
('delivery_charge_per_km', '5.00', 'Additional delivery charge per km', NOW(), NOW()),
('referral_bonus_amount', '50.00', 'Referral bonus amount for both referrer and referred', NOW(), NOW()),
('gst_percent', '18.00', 'GST percentage for invoices', NOW(), NOW()),
('order_sla_minutes', '30', 'SLA in minutes for order acceptance', NOW(), NOW()),
('max_file_size_mb', '50', 'Maximum upload file size in MB', NOW(), NOW()),
('supported_file_types', 'pdf,doc,docx,ppt,pptx,jpg,jpeg,png,zip', 'Supported file types for upload', NOW(), NOW()),
('auto_delete_files_days', '7', 'Days after order completion to delete uploaded files', NOW(), NOW())
ON CONFLICT (setting_key) DO NOTHING;

-- Categories
INSERT INTO categories (name, slug, description, display_order, is_active, created_at, updated_at) VALUES
('Documents', 'documents', 'Print documents, reports, and presentations', 1, TRUE, NOW(), NOW()),
('Photos', 'photos', 'Photo prints in various sizes', 2, TRUE, NOW(), NOW()),
('Posters', 'posters', 'Posters and banners', 3, TRUE, NOW(), NOW()),
('Business Cards', 'business-cards', 'Professional business cards', 4, TRUE, NOW(), NOW()),
('Brochures', 'brochures', 'Marketing brochures and flyers', 5, TRUE, NOW(), NOW()),
('Books', 'books', 'Book printing and binding', 6, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Coupons
INSERT INTO coupons (code, description, type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, is_platform_wide, shop_id, valid_from, valid_until, created_at, updated_at) VALUES
('WELCOME20', '20% off on your first order', 'PERCENTAGE', 20.00, 100.00, 100.00, 10000, TRUE, TRUE, NULL, NOW(), NOW() + INTERVAL '1 year', NOW(), NOW()),
('FLAT50', 'Flat Rs.50 off on orders above Rs.200', 'FIXED', 50.00, 200.00, 50.00, 5000, TRUE, TRUE, NULL, NOW(), NOW() + INTERVAL '6 months', NOW(), NOW()),
('FIRST50', 'Rs.50 off for first-time users (single use)', 'FIXED', 50.00, 100.00, 50.00, 1, TRUE, TRUE, NULL, NOW(), NOW() + INTERVAL '3 months', NOW(), NOW()),
('SAVE10', 'Flat 10% off (unlimited use)', 'PERCENTAGE', 10.00, 50.00, 150.00, NULL, TRUE, TRUE, NULL, NOW(), NOW() + INTERVAL '1 year', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Banners
INSERT INTO cms_banners (title, image_url, link_url, position, is_active, created_at, updated_at) VALUES
('Welcome to PrintHub', 'https://placehold.co/1200x400/2F6FED/FFFFFF?text=PrintHub', '/upload', 1, TRUE, NOW(), NOW()),
('Get 20% off on first order', 'https://placehold.co/1200x400/22D3EE/1A2740?text=20%25+OFF+First+Order', '/coupons', 2, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- CMS pages
INSERT INTO cms_pages (slug, title, content, is_published, published_at, created_at, updated_at) VALUES
('about', 'About PrintHub', '<h1>About PrintHub</h1><p>PrintHub is your trusted on-demand printing marketplace, connecting customers with nearby print shops for fast, reliable service.</p><p>Print Anything. Anywhere. Anytime.</p>', TRUE, NOW(), NOW(), NOW()),
('terms', 'Terms of Service', '<h1>Terms of Service</h1><p>By using PrintHub, you agree to these terms...</p>', TRUE, NOW(), NOW(), NOW()),
('privacy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>We respect your privacy and protect your personal information...</p>', TRUE, NOW(), NOW(), NOW()),
('faq', 'Frequently Asked Questions', '<h1>FAQs</h1><h2>How do I place an order?</h2><p>Simply upload your document, configure print options, and checkout.</p>', TRUE, NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;
