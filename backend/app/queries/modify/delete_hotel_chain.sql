DELETE FROM hotel_chain where name = %(name)s
RETURNING name, address, phone_number;
