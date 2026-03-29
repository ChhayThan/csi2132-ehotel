INSERT INTO booking (hid, room_number, customer_id, creation_date, checkin_date, checkout_date)
VALUES (%(hid)s, %(room_number)s, %(customer_id)s, %(creation_date)s, %(checkin_date)s, %(checkout_date)s)
RETURNING ref_id;
