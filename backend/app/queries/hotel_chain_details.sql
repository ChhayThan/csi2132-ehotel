SELECT name, address, phone_number, email_addresses, num_hotels FROM hotel_chain_detailed
WHERE name = %(name)s;
