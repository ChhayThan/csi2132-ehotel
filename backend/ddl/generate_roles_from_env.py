from pathlib import Path

from constants import (
	WEBSERVER_ADMIN_USER_PASSWORD,
	WEBSERVER_CUSTOMER_USER_PASSWORD,
	WEBSERVER_EMPLOYEE_USER_PASSWORD,
	WEBSERVER_USER_PASSWORD,
	WS_ADMIN_USER,
	WS_CUSTOMER_USER,
	WS_EMPLOYEE_USER,
	WS_USER
) 


if __name__ == '__main__':
	base_dir = Path(__file__).resolve().parent
	
	with open(base_dir / "init_roles.sql", "w") as f:
		for user, password in (
			(WS_USER, WEBSERVER_USER_PASSWORD),
			(WS_CUSTOMER_USER, WEBSERVER_CUSTOMER_USER_PASSWORD),
			(WS_EMPLOYEE_USER, WEBSERVER_EMPLOYEE_USER_PASSWORD),
			(WS_ADMIN_USER, WEBSERVER_ADMIN_USER_PASSWORD),
		):
			print(f"CREATE ROLE {user} PASSWORD '{password}';", file=f)

		print(
			f"""
GRANT SELECT ON hotel_chain, hotel_chain_email, hotel, hotel_email, room, room_amenity TO {WS_USER};
GRANT SELECT, INSERT, DELETE ON booking TO {WS_CUSTOMER_USER};
GRANT SELECT ON booking_archive TO {WS_CUSTOMER_USER};
GRANT SELECT ON booking, renting, booking_archive, renting_archive TO {WS_EMPLOYEE_USER};
GRANT DELETE ON booking, renting TO {WS_EMPLOYEE_USER};
GRANT INSERT ON renting, booking_archive, renting_archive TO {WS_EMPLOYEE_USER};
GRANT UPDATE ON renting TO {WS_EMPLOYEE_USER};
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_chain, hotel_chain_email, employee, hotel, hotel_email, room, room_amenity TO {WS_ADMIN_USER};

GRANT {WS_USER} TO {WS_CUSTOMER_USER} WITH INHERIT TRUE;
GRANT {WS_USER} TO {WS_EMPLOYEE_USER} WITH INHERIT TRUE;
GRANT {WS_EMPLOYEE_USER} TO {WS_ADMIN_USER} WITH INHERIT TRUE;
			""",
			file=f
		)
