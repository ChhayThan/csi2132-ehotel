DELETE FROM room WHERE hid = %(hid)s AND room_number = %(room_number)s
RETURNING room_number;
