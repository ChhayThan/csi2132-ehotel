# api to query the database server

import csv
from datetime import date
from io import StringIO
from pathlib import Path
from typing import Any, Optional, Union
import pandas as pd

from fastapi import Depends, FastAPI, HTTPException, status
from psycopg2 import connect, sql
from psycopg2.errors import UniqueViolation, ForeignKeyViolation, IntegrityError

from auth import create_access_token, get_current_user, hash_password, require_admin, require_customer, require_employee, verify_password
from auth_models import AuthenticatedUser, CurrentCustomerResponse, CurrentEmployeeResponse, CustomerLoginRequest, CustomerRegisterRequest, EmployeeCreationRequest, EmployeeLoginRequest, TokenResponse, TokenUser
from data_models import Address, Booking, BookingUserDefined, Employee, EmployeePartial, Hotel, HotelChain, HotelChainUserDefined, HotelPartial, HotelUserDefined, PartialHotelChain, Renting, Room, RoomPartial, RoomUserDefined
from constants import (
	DB_HOST,
	DB_NAME,
	DB_PORT,
	WEBSERVER_ADMIN_USER_PASSWORD,
	WEBSERVER_CUSTOMER_USER_PASSWORD,
	WEBSERVER_EMPLOYEE_USER_PASSWORD,
	WEBSERVER_USER_PASSWORD,
	WS_ADMIN_USER,
	WS_CUSTOMER_USER,
	WS_EMPLOYEE_USER,
	WS_USER
) 


app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent


def query_db_from_sql_file(
        file_path: str,
        params: Any = (),
        identifiers: tuple | dict = None,
        user: str = WS_USER,
        password: str = WEBSERVER_USER_PASSWORD,
        host: str = DB_HOST,
        port: int = DB_PORT
        ):
    # Resolve SQL files relative to the backend package so imports work from any cwd.
    with open(BASE_DIR / file_path, "r") as f:
        query = f.read()

    if type(identifiers) is tuple:
        query = sql.SQL(query).format(*(sql.Identifier(identifier) for identifier in identifiers))
    elif type(identifiers) is dict:
        query = sql.SQL(query).format(**{arg_name: sql.Identifier(identifier) for arg_name, identifier in identifiers.items()})

    return query_db({"_main": (query, params)}, user, password, host, port).get("_main", [])


def execute_multiple_from_sql_files(
        statements: dict[str, tuple[str, Any, tuple | dict | None]],
        user: str = WS_USER,
        password: str = WEBSERVER_USER_PASSWORD,
        host: str = DB_HOST,
        port: int = DB_PORT
        ):
    
    queries = {}

    for name, request in statements:
        file_path, params, identifiers = request
        with open(BASE_DIR / file_path, "r") as f:
            query = f.read()

        if type(identifiers) is tuple:
            query = sql.SQL(query).format(*(sql.Identifier(identifier) for identifier in identifiers))
        elif type(identifiers) is dict:
            query = sql.SQL(query).format(**{arg_name: sql.Identifier(identifier) for arg_name, identifier in identifiers.items()})

        queries[name] = (query, params)

    return query_db(queries, user, password, host, port)


def query_db(statements: dict[str, tuple[str, Any]], user: str = WS_USER, password: str = WEBSERVER_USER_PASSWORD, host: str = DB_HOST, port: int = DB_PORT):
    # Prefer DATABASE_URL when provided, but keep explicit params/env fallbacks for local use.
    connection_kwargs = {
        "dbname": DB_NAME,
        "user": user,
        "password": password,
        "host": host,
        "port": port,
    }

    res = {}

    with connect(**connection_kwargs) as conn:
        # multiple requests in one with block bound and executed as single transaction
        for name, request in statements.items():
            query, params = request
            df = pd.read_sql_query(query, conn, params=params)
            res[name] = df.to_dict(orient="records")

    return res


def build_token_response(actor_id: str, actor_type: str, role: str, email: Optional[str] = None) -> TokenResponse:
    # Customer and employee login return the same bearer-token payload shape.
    token = create_access_token(actor_id=actor_id, actor_type=actor_type, role=role)
    return TokenResponse(
        access_token=token,
        user=TokenUser(
            id=actor_id,
            actor_type=actor_type,
            role=role,
            email=email,
        ),
    )


def parse_pg_array(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value]
    if not isinstance(value, str):
        return [str(value)]
    if not (value.startswith("{") and value.endswith("}")):
        return [value]

    inner = value[1:-1]
    if inner == "":
        return []

    # PostgreSQL array strings use CSV-style escaping for quoted elements.
    return next(csv.reader(StringIO(inner), delimiter=",", quotechar='"', escapechar="\\"))



## Public APIs - no authentication

@app.get("/hotels/available")
def get_hotels(city: str = None, country: str = None, checkin_date: date = None, checkout_date: date = None) -> list[Hotel]:
    res = query_db_from_sql_file(
        "queries/available_hotels_in_location.sql",
        {"city": city, "country": country, "checkin_date": checkin_date, "checkout_date": checkout_date}
    )

    for row in res:
        row["address"] = Address(
            city=row.pop("address_city"),
            street_address=row.pop("address_street_address"),
            country=row.pop("address_country")
        )

    return [Hotel(**row) for row in res]


@app.get("/hotels/top")
def get_top_hotels(limit: int = 10) -> list[Hotel]:
    res = query_db_from_sql_file(
        "queries/top_hotels.sql",
        {"n": limit}
    )

    for row in res:
        row["address"] = Address(
            city=row.pop("address_city"),
            street_address=row.pop("address_street_address"),
            country=row.pop("address_country")
        )

    return [Hotel(**row) for row in res]


@app.get("/hotels/{hotel_id}")
def get_hotel_details(hotel_id: int) -> Hotel:
    res = query_db_from_sql_file(
        "queries/hotel_details.sql",
        {"hid": hotel_id}
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")

    row = res[0]
    row["address"] = Address(
        city=row.pop("address_city"),
        street_address=row.pop("address_street_address"),
        country=row.pop("address_country")
    )
    row["email_addresses"] = parse_pg_array(row.pop("email_addresses", None))

    return Hotel(**row)


@app.get("/hotels/{hotel_id}/rooms/available")
def get_available_rooms(hotel_id: int, checkin_date: date, checkout_date: date) -> list[Room]:
    res = query_db_from_sql_file(
        "queries/available_rooms_for_hotel.sql",
        {"hid": hotel_id, "checkin_date": checkin_date, "checkout_date": checkout_date}
    )

    for row in res:
        row["amenities"] = parse_pg_array(row.get("amenities"))

    return [Room(**row) for row in res]


@app.get("/hotels/{hotel_id}/rooms/{room_number}")
def get_room_details(hotel_id: int, room_number: int) -> Room:
    res = query_db_from_sql_file(
        "queries/room_details.sql",
        {"hid": hotel_id, "room_number": room_number}
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    res[0]["amenities"] = parse_pg_array(res[0].get("amenities"))

    return Room(**res[0])


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: CustomerLoginRequest) -> TokenResponse:
    # Customers authenticate by email
    customer = query_db_from_sql_file(
        "queries/auth/get_customer_by_email.sql",
        {"email": payload.email.strip()},
    )
    if len(customer) == 0 or not verify_password(payload.password, customer[0]["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return build_token_response(
        actor_id=customer[0]["id"],
        actor_type="customer",
        role="customer",
        email=customer[0]["email_address"],
    )


@app.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: CustomerRegisterRequest) -> TokenResponse:
    customer_id = payload.drivers_license.strip()
    email = payload.email.strip()

    # We reject duplicate email and duplicate driver's license before inserting.
    if len(query_db_from_sql_file("queries/auth/get_customer_by_email.sql", {"email": email})) > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if len(query_db_from_sql_file("queries/auth/get_customer_by_id.sql", {"customer_id": customer_id})) > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Drivers license already registered")

    customer = query_db_from_sql_file(
        "queries/auth/create_customer.sql",
        {
            "customer_id": customer_id,
            "first_name": payload.first_name.strip(),
            "last_name": payload.last_name.strip(),
            "address": payload.address.strip(),
            "email": email,
            "password_hash": hash_password(payload.password),
            "registration_date": date.today(),
        },
    )

    return build_token_response(
        actor_id=customer[0]["id"],
        actor_type="customer",
        role="customer",
        email=customer[0]["email_address"],
    )


@app.get("/auth/me", response_model=Union[CurrentCustomerResponse, CurrentEmployeeResponse])
def get_current_actor(current_user: AuthenticatedUser = Depends(get_current_user)) -> Union[CurrentCustomerResponse, CurrentEmployeeResponse]:
    # Hydrate the authenticated principal into the correct frontend-facing actor shape.
    if current_user.actor_type == "customer":
        customer = query_db_from_sql_file(
            "queries/auth/get_customer_by_id.sql",
            {"customer_id": current_user.actor_id},
        )
        if len(customer) == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        row = customer[0]
        return CurrentCustomerResponse(
            id=row["id"],
            actor_type="customer",
            role="customer",
            email=row["email_address"],
            first_name=row["first_name"],
            last_name=row["last_name"],
        )

    if current_user.actor_type == "employee":
        employee = query_db_from_sql_file(
            "queries/auth/get_employee_by_id.sql",
            {"employee_id": int(current_user.actor_id)},
        )
        if len(employee) == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        row = employee[0]
        return CurrentEmployeeResponse(
            id=row["id"],
            actor_type="employee",
            role=row["role"],
            first_name=row["first_name"],
            last_name=row["last_name"],
            address=row["address"],
            hid=row["hid"],
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


## Customer APIs - require authentication

@app.get("/{customer_id}/bookings")
def get_bookings(customer_id: str, archived: bool, current_user: AuthenticatedUser = Depends(require_customer)) -> list[Booking]:
    # Enforce that customers can only read their own data.
    if current_user.actor_id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    res = query_db_from_sql_file(
        "queries/bookings_for_customer.sql" if not archived else "queries/archived_bookings_for_customer.sql",
        {"customer_id": customer_id},
        user=WS_CUSTOMER_USER,
        password=WEBSERVER_CUSTOMER_USER_PASSWORD,
    )

    return [Booking(**row) for row in res]


@app.get("/{customer_id}/bookings/{booking_id}")
def get_booking_details(customer_id: str, booking_id: int, current_user: AuthenticatedUser = Depends(require_customer)) -> Booking:
    if current_user.actor_id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    res = query_db_from_sql_file(
        "queries/booking_details.sql",
        {"ref_id": booking_id, "customer_id": customer_id},
        user=WS_CUSTOMER_USER,
        password=WEBSERVER_CUSTOMER_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    booking = Booking(**res[0])

    return booking


@app.post("/{customer_id}/bookings/new", status_code=status.HTTP_201_CREATED)
def create_booking(customer_id, new_booking: BookingUserDefined, current_user: AuthenticatedUser = Depends(require_customer)) -> int:
    if current_user.actor_id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
    try:
        res = query_db_from_sql_file(
            "queries/modify/create_booking.sql",
            {
                "hid": new_booking.hid,
                "room_number": new_booking.room_number,
                "customer_id": customer_id,
                "creation_date": str(date.today()),
                "checkin_date": new_booking.checkin_date,
                "checkout_date": new_booking.checkout_date,
            },
            user=WS_CUSTOMER_USER,
            password=WEBSERVER_CUSTOMER_USER_PASSWORD,
        )
    except UniqueViolation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking conflict")
    except ForeignKeyViolation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hotel or room does not exist")
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid booking details")

    return res[0]["ref_id"]


@app.delete("/{customer_id}/bookings/{booking_id}/cancel")
def cancel_booking(customer_id: str, booking_id: int, current_user: AuthenticatedUser = Depends(require_customer)) -> Booking:
    if current_user.actor_id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
    res = query_db_from_sql_file(
        "queries/modify/delete_booking.sql",
        {"booking_id": booking_id, "customer_id": customer_id},
        user=WS_CUSTOMER_USER,
        password=WEBSERVER_CUSTOMER_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found. Note: archived bookings cannot be removed")

    return Booking(**res[0])


## Employee APIs - require authentication

@app.get("/employee/hotels/{hotel_id}/bookings")
def get_hotel_bookings(hotel_id: int, archived: bool, current_user: AuthenticatedUser = Depends(require_employee)) -> list[Booking]:
    res = query_db_from_sql_file(
        "queries/all_bookings_for_hotel.sql" if not archived else "queries/all_archived_bookings_for_hotel.sql",
        {"hid": hotel_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )
    
    return [Booking(**row) for row in res]


@app.get("/employee/hotels/{hotel_id}/rentings")
def get_hotel_rentings(hotel_id: int, archived: bool, current_user: AuthenticatedUser = Depends(require_employee)) -> list[Renting]:
    res = query_db_from_sql_file(
        "queries/all_rentings_for_hotel.sql" if not archived else "queries/all_archived_rentings_for_hotel.sql",
        {"hid": hotel_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )

    return [Renting(**row) for row in res]


@app.post("/employee/login", response_model=TokenResponse)
def employee_login(payload: EmployeeLoginRequest) -> TokenResponse:
    employee = query_db_from_sql_file(
        "queries/auth/get_employee_for_login.sql",
        {"employee_id": payload.employee_id},
    )
    if len(employee) == 0 or not verify_password(payload.password, employee[0]["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid employee ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return build_token_response(
        actor_id=str(employee[0]["id"]),
        actor_type="employee",
        role=employee[0]["role"],
    )


## Admin APIs - require authentication

def add_email_addresses(table_name: str, fk_col: str, fk_value: Any, email_addresses: list[str]):
    for email_address in email_addresses:
        try:
            query_db_from_sql_file(
                "queries/modify/add_email.sql",
                {
                    "fk": fk_value,
                    "email_address": email_address.strip(),
                },
                identifiers={
                    "email_table": table_name,
                    "fk_col": fk_col,
                },
                user=WS_ADMIN_USER,
                password=WEBSERVER_ADMIN_USER_PASSWORD,
            )
        except UniqueViolation:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Email address {email_address} already associated with this entity")
        except IntegrityError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid email address {email_address}")

@app.get("/admin/hotel_chains")
def get_hotel_chains(current_user: AuthenticatedUser = Depends(require_admin)) -> list[HotelChain]:
    res = query_db_from_sql_file(
        "queries/all_hotel_chains.sql",
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    for row in res:
        row["email_addresses"] = parse_pg_array(row.get("email_addresses"))

    return [HotelChain(**row) for row in res]


@app.post("/admin/hotel_chains/new", status_code=status.HTTP_201_CREATED)
def create_hotel_chain(hotel_chain: HotelChainUserDefined, current_user: AuthenticatedUser = Depends(require_admin)) -> str:
    try:
        res = query_db_from_sql_file(
            "queries/modify/create_hotel_chain.sql",
            {
                "name": hotel_chain.name.strip(),
                "address": hotel_chain.address.strip(),
                "phone_number": hotel_chain.phone_number.strip(),
            },
            user=WS_ADMIN_USER,
            password=WEBSERVER_ADMIN_USER_PASSWORD,
        )
    except UniqueViolation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hotel chain already exists")
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid hotel chain details")
    
    add_email_addresses("hotel_chain_email", "chain_name", hotel_chain.name.strip(), hotel_chain.email_addresses or ())

    return res[0]["name"]


@app.put("/admin/hotel_chains/{chain_name}/manage")
def edit_hotel_chain(chain_name: str, new_hotel_chain: PartialHotelChain, current_user: AuthenticatedUser = Depends(require_admin)) -> str:
    res = query_db_from_sql_file(
        "queries/hotel_chain_details.sql",
        {"name": chain_name},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel chain not found")
    
    old_chain = HotelChain(**res[0])

    try:
        new_name = new_hotel_chain.name.strip() or old_chain.name

        # bundle updates as a single transaction
        transaction = {
            "update_hotel_chain": (
                "queries/modify/update_hotel_chain.sql",
                {
                    "old_name": chain_name,
                    "name": new_name,
                    "address": new_hotel_chain.address.strip() or old_chain.address,
                    "phone_number": new_hotel_chain.phone_number.strip() or old_chain.phone_number,
                },
                None,
            ),
        }

        if new_hotel_chain.email_addresses is not None:
            # remove existing emails
            transaction["delete_existing_emails"] = (
                "queries/modify/delete_hotel_chain_email.sql",
                {"name": new_name},
                None,
            )

            # add the new email addresses for the hotel chain
            transaction.update({
                f"add_email_{email_address}": (
                    "queries/modify/add_email.sql",
                    {
                        "fk": new_name,
                        "email_address": email_address.strip(),
                    },
                    {
                        "email_table": "hotel_chain_email",
                        "fk_col": "name",
                    },
                )
                for email_address in new_hotel_chain.email_addresses
            })

        res = execute_multiple_from_sql_files(transaction, user=WS_ADMIN_USER, password=WEBSERVER_ADMIN_USER_PASSWORD)
    
    except UniqueViolation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uniqueness violation")
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid hotel chain details")
    
    return res["update_hotel_chain"][0].get("name")


@app.delete("/admin/hotel_chains/{chain_name}/delete")
def delete_hotel_chain(chain_name: str, current_user: AuthenticatedUser = Depends(require_admin)) -> HotelChain:
    res = query_db_from_sql_file(
        "queries/hotel_chain_details.sql",
        {"name": chain_name},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel chain not found")
    
    old_chain = HotelChain(**res[0])

    query_db_from_sql_file(
        "queries/modify/delete_hotel_chain.sql",
        {"name": chain_name},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    return old_chain


@app.get("/admin/hotel_chains/{chain_name}/hotels")
def get_hotels_in_chain(chain_name: str, current_user: AuthenticatedUser = Depends(require_admin)) -> list[Hotel]:
    res = query_db_from_sql_file(
        "queries/all_hotels_in_chain.sql",
        {"chain_name": chain_name},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    for row in res:
        row["address"] = Address(
            city=row.pop("address_city"),
            street_address=row.pop("address_street_address"),
            country=row.pop("address_country")
        )
        row["email_addresses"] = parse_pg_array(row.get("email_addresses"))

    return [Hotel(**row) for row in res]


@app.post("/admin/hotel_chains/{chain_name}/hotels/new", status_code=status.HTTP_201_CREATED)
def create_hotel_in_chain(chain_name, hotel: HotelUserDefined, current_user: AuthenticatedUser = Depends(require_admin)) -> int:
    try:
        res = query_db_from_sql_file(
            "queries/modify/create_hotel.sql",
            {
                "name": hotel.name,
                "rating": hotel.rating,
                "country": hotel.address.country,
                "city": hotel.address.city,
                "street_address": hotel.address.street_address,
                "phone_number": hotel.phone_number,
                "image": hotel.image,
                "chain_name": chain_name,
                "manager_eid": hotel.manager_eid
            },
            user=WS_ADMIN_USER,
            password=WEBSERVER_ADMIN_USER_PASSWORD,
        )
    except ForeignKeyViolation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel chain not found")
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid hotel details")
    
    hid = res[0]["hid"]
    add_email_addresses("hotel_email", "hid", hid, hotel.email_addresses or ())

    return hid


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/manage")
def edit_hotel_in_chain(chain_name: str, hotel_id: int, new_hotel: HotelPartial, current_user: AuthenticatedUser = Depends(require_admin)) -> int:
    res = query_db_from_sql_file(
        "queries/hotel_details.sql",
        {"hid": hotel_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    
    old_hotel = Hotel(**res[0])

    try:
        # bundle updates as a single transaction
        transaction = {
            "update_hotel": (
                "queries/modify/update_hotel.sql",
                {
                    "hid": hotel_id,
                    "name": new_hotel.name or old_hotel.name,
                    "rating": new_hotel.rating or old_hotel.rating,
                    "country": new_hotel.address.country or old_hotel.address.country,
                    "city": new_hotel.address.city or old_hotel.address.city,
                    "street_address": new_hotel.address.street_address or old_hotel.address.street_address,
                    "phone_number": new_hotel.phone_number or old_hotel.phone_number,
                    "image": new_hotel.image or old_hotel.image,
                    "manager_eid": new_hotel.manager_eid or old_hotel.manager_eid
                },
                None,
            ),
        }

        if new_hotel.email_addresses is not None:
            # remove existing emails
            transaction["delete_existing_emails"] = (
                "queries/modify/delete_hotel_email.sql",
                {"hid": hotel_id},
                None,
            )

            # add the new email addresses for the hotel chain
            transaction.update({
                f"add_email_{email_address}": (
                    "queries/modify/add_email.sql",
                    {
                        "fk": hotel_id,
                        "email_address": email_address.strip(),
                    },
                    {
                        "email_table": "hotel_email",
                        "fk_col": "hid",
                    },
                )
                for email_address in new_hotel.email_addresses
            })

        res = execute_multiple_from_sql_files(transaction, user=WS_ADMIN_USER, password=WEBSERVER_ADMIN_USER_PASSWORD)
    
    except UniqueViolation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uniqueness violation")
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid hotel details")
    
    return res["update_hotel"][0].get("hid")


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/delete")
def delete_hotel_in_chain(chain_name: str, hotel_id: int, current_user: AuthenticatedUser = Depends(require_admin)) -> Hotel:
    res = query_db_from_sql_file(
        "queries/hotel_details.sql",
        {"hid": hotel_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    
    old_hotel = Hotel(**res[0])

    query_db_from_sql_file(
        "queries/modify/delete_hotel.sql",
        {"hid": hotel_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    return old_hotel


@app.get("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms")
def get_rooms_in_hotel(hotel_id: int, current_user: AuthenticatedUser = Depends(require_admin)) -> list[Room]:
    res = query_db_from_sql_file(
        "queries/all_rooms_for_hotel.sql",
        {"hid": hotel_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    for row in res:
        row["amenities"] = parse_pg_array(row.get("amenities"))

    return [Room(**row) for row in res]


@app.post("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms/new", status_code=status.HTTP_201_CREATED)
def create_room_in_hotel(chain_name: str, hotel_id: int, room: RoomUserDefined, current_user: AuthenticatedUser = Depends(require_admin)) -> int:
    try:
        res = query_db_from_sql_file(
            "queries/modify/create_room.sql",
            {
                "hid": hotel_id,
                "room_number": room.room_number,
                "price": room.price,
                "capacity": room.capacity,
                "view": room.view,
                "extendable": room.extendable,
                "problem": room.problem,
                "image": room.image,
            },
            user=WS_ADMIN_USER,
            password=WEBSERVER_ADMIN_USER_PASSWORD,
        )
    except ForeignKeyViolation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid room details")
    
    for amenity in room.amenities or ():
        try:
            query_db_from_sql_file(
                "queries/modify/add_amenity.sql",
                {
                    "hid": hotel_id,
                    "room_number": room.room_number,
                    "amenity": amenity.strip(),
                },
                user=WS_ADMIN_USER,
                password=WEBSERVER_ADMIN_USER_PASSWORD,
            )
        except UniqueViolation:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Amenity {amenity} already associated with this room")
        except IntegrityError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid amenity {amenity}")
    
    return res[0]["room_number"]


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms/{room_number}/manage")
def edit_room_in_hotel(chain_name: str, hotel_id: int, room_number: int, new_room: RoomPartial, current_user: AuthenticatedUser = Depends(require_admin)) -> int:
    res = query_db_from_sql_file(
        "queries/room_details.sql",
        {"hid": hotel_id, "room_number": room_number},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    
    old_room = Room(**res[0])

    try:
        # bundle updates as a single transaction
        transaction = {
            "update_room": (
                "queries/modify/update_room.sql",
                {
                    "hid": hotel_id,
                    "old_room_number": old_room.room_number,
                    "room_number": new_room.room_number or old_room.room_number,
                    "price": new_room.price or old_room.price,
                    "capacity": new_room.capacity or old_room.capacity,
                    "view": new_room.view or old_room.view,
                    "extendable": new_room.extendable if new_room.extendable is not None else old_room.extendable,
                    "problem": new_room.problem or old_room.problem,
                    "image": new_room.image or old_room.image,
                },
                None,
            ),
        }

        if new_room.amenities is not None:
            # remove existing emails
            transaction["delete_existing_amentities"] = (
                "queries/modify/delete_amenity.sql",
                {"hid": hotel_id, "room_numner": old_room.room_number},
                None,
            )

            # add the new email addresses for the hotel chain
            transaction.update({
                f"add_amenity_{amenity}": (
                    "queries/modify/add_amenity.sql",
                    {
                        "hid": hotel_id,
                        "room_number": "room_number",
                        "amenity": amenity.strip(),
                    },
                    None,
                )
                for amenity in new_room.amenities
            })

        res = execute_multiple_from_sql_files(transaction, user=WS_ADMIN_USER, password=WEBSERVER_ADMIN_USER_PASSWORD)
    
    except UniqueViolation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uniqueness violation")
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid room details")
    
    return res["update_room"][0].get("room_number")


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms/{room_number}/delete")
def delete_room_in_hotel(chain_name: str, hotel_id: int, room_number: int, current_user: AuthenticatedUser = Depends(require_admin)):
    res = query_db_from_sql_file(
        "queries/room_details.sql",
        {"hid": hotel_id, "room_number": room_number},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    
    old_room = Room(**res[0])

    query_db_from_sql_file(
        "queries/modify/delete_room.sql",
        {"hid": hotel_id, "room_number": room_number},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    return old_room


@app.get("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees")
def get_employees_in_hotel(hotel_id: int, current_user: AuthenticatedUser = Depends(require_admin)) -> list[Employee]:
    res = query_db_from_sql_file(
        "queries/all_employees_of_hotel.sql",
        {"hid": hotel_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    return [Employee(**row) for row in res]


@app.post("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/new", status_code=status.HTTP_201_CREATED)
def create_employee_in_hotel(chain_name: str, hotel_id: int, employee: EmployeeCreationRequest, current_user: AuthenticatedUser = Depends(require_admin)) -> int:
    try:
        res = query_db_from_sql_file(
            "queries/auth/create_employee.sql",
            {
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "address": employee.address,
                "password_hash": hash_password(employee.password),
                "role": employee.role,
                "hid": hotel_id,
            },
            user=WS_ADMIN_USER,
            password=WEBSERVER_ADMIN_USER_PASSWORD,
        )
    except ForeignKeyViolation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid employee details")

    return res[0]["id"]


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/{employee_id}/manage")
def edit_employee_in_hotel(chain_name: str, hotel_id: int, employee_id: int, new_employee: EmployeePartial, current_user: AuthenticatedUser = Depends(require_admin)) -> int:
    res = query_db_from_sql_file(
        "queries/employee_details.sql",
        {"eid": employee_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    
    old_employee = Employee(**res[0])
    
    try:
        res = query_db_from_sql_file(
            "queries/modify/update_employee.sql",
            {
                "eid": employee_id,
                "first_name": new_employee.first_name or old_employee.first_name,
                "last_name": new_employee.last_name or old_employee.last_name,
                "address": new_employee.address or old_employee.address,
                "role": new_employee.role or old_employee.role
            },
            user=WS_ADMIN_USER,
            password=WEBSERVER_ADMIN_USER_PASSWORD,
        )
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid employee details")
    
    return res[0]["id"]


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/{employee_id}/delete")
def delete_employee_in_hotel(chain_name: str, hotel_id: int, employee_id: int, current_user: AuthenticatedUser = Depends(require_admin)) -> Employee:
    res = query_db_from_sql_file(
        "queries/employee_details.sql",
        {"eid": employee_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    
    old_employee = Employee(**res[0])

    query_db_from_sql_file(
        "queries/modify/delete_employee.sql",
        {"eid": employee_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    return old_employee
