-- Force fix Kalpataru's password hash (V3 update may not have taken effect)
UPDATE users SET password_hash = '$2b$12$LbYAFc7W6it/zEeC/avcFOVRxIMUxSXYDsGLNTVdxmJ0zDv1e/sqK', updated_at = NOW() WHERE email = 'kalpataru05aug@gmail.com' OR phone = '+919146922610';
