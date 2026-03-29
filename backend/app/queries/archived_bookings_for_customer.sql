SELECT ref_id, hid, room_number, customer_id, creation_date, checkin_date, checkout_date FROM booking_archive
WHERE customer_id = %(customer_id)s;
