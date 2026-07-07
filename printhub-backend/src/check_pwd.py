import bcrypt
hashes = [
    ('Aditya', '$2b$12$f.5r8HuhjNLEhIY5TC6D0uSrYLT5jK6UWWdsLtjM5TznlyLhh1u/C'),
    ('Kalpataru', '$2b$12$CcI3.0M5JKnXDf0ZVuWBx.4czs0WreiqePva1dQvxp288zqxN.mTW'),
    ('Jainish', '$2b$12$lMBqugpGDCmTsIjAmwUOmuJI7HlpInG2wpWZLFWCtZfUBRtGiZdMG'),
]
candidates = ['admin', 'admin123', 'admin1234', 'password', 'adminpassword', 'Admin@123', 'Password@123', 'Admin@1234', 'xeroxshop', 'printhub']
for name, h in hashes:
    for c in candidates:
        if bcrypt.checkpw(c.encode(), h.encode()):
            print(f'{name}: {c}')
            break
    else:
        print(f'{name}: NO MATCH')
