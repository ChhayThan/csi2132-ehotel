DELETE FROM hotel_chain_email WHERE name = %(name)s
RETURNING name, email_address;
