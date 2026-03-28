INSERT INTO employee (
    first_name,
    last_name,
    address,
    password_hash,
    role,
    hid
)
VALUES (
    %(first_name)s,
    %(last_name)s,
    %(address)s,
    %(password_hash)s,
    %(role)s,
    %(hid)s
)
RETURNING id;