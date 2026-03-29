INSERT INTO hotel_chain (name, address, phone_number) VALUES (%(name)s, %(address)s, %(phone_number)s)
RETURNING name;
