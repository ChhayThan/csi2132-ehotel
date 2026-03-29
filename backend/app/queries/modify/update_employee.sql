UPDATE employee
SET
  first_name = %(first_name)s,
  last_name = %(last_name)s,
  address = %(address)s,
  role = %(role)s
WHERE id = %(eid)s
RETURNING id;
