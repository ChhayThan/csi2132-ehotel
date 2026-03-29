SELECT id, first_name, last_name, address, email_address, password_hash, registration_date
FROM customer
WHERE email_address = %(email)s;
