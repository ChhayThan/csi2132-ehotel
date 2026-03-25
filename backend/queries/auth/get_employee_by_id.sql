SELECT id, first_name, last_name, address, role, hid
FROM employee
WHERE id = %(employee_id)s;
