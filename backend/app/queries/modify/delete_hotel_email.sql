DELETE FROM hotel_email WHERE hid = %(hid)s
RETURNING hid, email_address;
