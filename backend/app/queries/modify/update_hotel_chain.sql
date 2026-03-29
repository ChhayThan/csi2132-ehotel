UPDATE hotel_chain
SET name = %(name)s, address = %(address)s, phone_number = %(phone_number)s
WHERE name = %(old_name)s
RETURNING name;
