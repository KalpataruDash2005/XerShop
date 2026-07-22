-- Fix password hashes for seed users (previous V2 hashes were invalid)
-- Admins: password = admin123
-- Shop owner: password = shop123

UPDATE users SET password_hash = '$2b$12$sI.SaxwuQsNy5I5uTOdLEeQbpyY8ym0eIgO9sPaDXpS6OLOmn3T8W', updated_at = NOW() WHERE email = 'aditya.bajoria0208@gmail.com';
UPDATE users SET password_hash = '$2b$12$1TPIq1eLKlyGpu4Y4uMr/eYWvIMyWAsA2c6dUmm77DQhXLTAirNfa', updated_at = NOW() WHERE email = 'kalpataru05aug@gmail.com';
UPDATE users SET password_hash = '$2b$12$i9Teg1733xkznochb/cN7eax1OWZSmFAI8UhBR31ZBnU.dvARv53.', updated_at = NOW() WHERE email = 'jainishbaria42@gmail.com';
UPDATE users SET password_hash = '$2b$12$03BVYo27sULDFR.U9Ss3Wez9S66uak.PPRdk7yBwGejCSIKQVdsy6', updated_at = NOW() WHERE email = 'shop@demo.com';
