-- Kalpataru's admin user was never created by V2 (migration skipped due to prior partial runs).
-- A placeholder user was registered via API with email kalpataru05aug@gmail.com (id 228).
-- Promote it to ADMIN and fix the password hash.

UPDATE users SET role = 'ADMIN', password_hash = '$2b$12$1TPIq1eLKlyGpu4Y4uMr/eYWvIMyWAsA2c6dUmm77DQhXLTAirNfa', is_verified = TRUE, updated_at = NOW()
WHERE email = 'kalpataru05aug@gmail.com';
