import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

from app.constants import (
	WEBSERVER_ADMIN_USER_PASSWORD,
	WEBSERVER_AUTH_USER_PASSWORD,
	WEBSERVER_CUSTOMER_USER_PASSWORD,
	WEBSERVER_EMPLOYEE_USER_PASSWORD,
	WEBSERVER_USER_PASSWORD,
	WS_ADMIN_USER,
	WS_AUTH_USER,
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
			(WS_AUTH_USER, WEBSERVER_AUTH_USER_PASSWORD)
		):
			print(f"CREATE ROLE {user} LOGIN PASSWORD '{password}';", file=f)

		print(
			f"""
GRANT SELECT ON hotel_chain, hotel_chain_email, hotel, hotel_email, room, room_amenity, hotel_capacity, hotel_chain_detailed, hotel_detailed, rooms_by_city TO {WS_USER};
GRANT EXECUTE ON FUNCTION available_rooms TO {WS_USER};
GRANT SELECT, INSERT, DELETE ON booking TO {WS_CUSTOMER_USER};
GRANT USAGE ON booking_ref_id_seq TO {WS_CUSTOMER_USER};
GRANT SELECT ON booking_archive TO {WS_CUSTOMER_USER};
GRANT SELECT ON booking, renting, booking_archive, renting_archive TO {WS_EMPLOYEE_USER};
GRANT DELETE ON booking, renting TO {WS_EMPLOYEE_USER};
GRANT INSERT ON renting, booking_archive, renting_archive TO {WS_EMPLOYEE_USER};
GRANT USAGE ON renting_ref_id_seq TO {WS_EMPLOYEE_USER};
GRANT UPDATE ON renting TO {WS_EMPLOYEE_USER};
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_chain, hotel_chain_email, employee, hotel, hotel_email, room, room_amenity TO {WS_ADMIN_USER};
GRANT USAGE ON employee_id_seq, hotel_hid_seq TO {WS_ADMIN_USER};
GRANT SELECT ON customer, employee TO {WS_AUTH_USER};
GRANT INSERT ON customer TO {WS_AUTH_USER};

GRANT {WS_USER} TO {WS_CUSTOMER_USER} WITH INHERIT TRUE;
GRANT {WS_USER} TO {WS_EMPLOYEE_USER} WITH INHERIT TRUE;
GRANT {WS_EMPLOYEE_USER} TO {WS_ADMIN_USER} WITH INHERIT TRUE;
			""",
			file=f
		)
