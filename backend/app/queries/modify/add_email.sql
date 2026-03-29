INSERT INTO {email_table} ({fk_col}, "email_address") VALUES (%(fk)s, %(email_address)s)
RETURNING email_address;