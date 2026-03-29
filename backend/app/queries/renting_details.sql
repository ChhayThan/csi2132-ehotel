SELECT hid, room_number, customer_id, employee_id, creation_date, checkin_date, checkout_date, payment_type, payment_amount FROM renting
WHERE ref_id = %(ref_id)s;
