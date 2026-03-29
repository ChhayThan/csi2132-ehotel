DELETE FROM hotel WHERE hid = %(hid)s
RETURNING hid;
