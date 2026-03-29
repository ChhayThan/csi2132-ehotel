SELECT id, first_name, last_name, address, email_address, registration_date
FROM customer
WHERE id = %(customer_id)s;
