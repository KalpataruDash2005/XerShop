import bcrypt
h1 = "$2b$12$f.5r8HuhjNLEhIY5TC6D0uSrYLT5jK6UWWdsLtjM5TznlyLhh1u/C"
h2 = "$2b$12$CcI3.0M5JKnXDf0ZVuWBx.4czs0WreiqePva1dQvxp288zqxN.mTW"
h3 = "$2b$12$lMBqugpGDCmTsIjAmwUOmuJI7HlpInG2wpWZLFWCtZfUBRtGiZdMG"
print("h1:", bcrypt.checkpw(b"adminpassword", h1.encode()))
print("h2:", bcrypt.checkpw(b"adminpassword", h2.encode()))
print("h3:", bcrypt.checkpw(b"adminpassword", h3.encode()))
