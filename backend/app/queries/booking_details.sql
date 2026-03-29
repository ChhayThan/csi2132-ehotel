SELECT ref_id, hid, room_number, customer_id, creation_date, checkin_date, checkout_date FROM booking
WHERE ref_id = %(ref_id)s;
