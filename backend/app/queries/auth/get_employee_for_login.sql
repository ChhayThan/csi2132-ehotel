SELECT id, first_name, last_name, address, password_hash, role, hid
FROM employee
WHERE id = %(employee_id)s;
