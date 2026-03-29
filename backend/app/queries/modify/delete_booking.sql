DELETE FROM booking WHERE ref_id = %(booking_id)s AND customer_id = %(customer_id)s 
RETURNING ref_id, hid, room_number, customer_id, creation_date, checkin_date, checkout_date;
