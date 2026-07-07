-- Create a default admin account (password: admin123)
INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at)
SELECT 'Admin', 'admin@printhub.com', '+919999999998', '$2b$12$f.5r8HuhjNLEhIY5TC6D0uSrYLT5jK6UWWdsLtjM5TznlyLhh1u/C', 'ADMIN', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN');
