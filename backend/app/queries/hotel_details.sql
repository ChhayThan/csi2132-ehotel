SELECT hid, name, address_city, address_street_address, address_country, image, chain_name, rating, phone_number, email_addresses 
FROM hotel_detailed
WHERE hid = %(hid)s;
