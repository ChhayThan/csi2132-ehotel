DELETE FROM employee WHERE id = %(eid)s
RETURNING id;
