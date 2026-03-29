INSERT INTO customer (
    id,
    first_name,
    last_name,
    address,
    email_address,
    password_hash,
    registration_date
)
VALUES (
    %(customer_id)s,
    %(first_name)s,
    %(last_name)s,
    %(address)s,
    %(email)s,
    %(password_hash)s,
    %(registration_date)s
)
RETURNING id, first_name, last_name, address, email_address, registration_date;
