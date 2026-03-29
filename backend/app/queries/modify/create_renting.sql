INSERT INTO renting (hid, room_number, customer_id, employee_id, creation_date, checkin_date, checkout_date, payment_type, payment_amount)
VALUES (%(hid)s, %(room_number)s, %(customer_id)s, %(employee_id)s, %(creation_date)s, %(checkin_date)s, %(checkout_date)s, %(payment_type)s, %(payment_amount)s)
RETURNING ref_id;
