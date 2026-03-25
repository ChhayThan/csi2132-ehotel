# api to query the database server

import csv
import os
from datetime import date
from io import StringIO
from pathlib import Path
from typing import Any, Optional, Union
import pandas as pd
from typing_extensions import Literal

from fastapi import Depends, FastAPI, HTTPException, status
from psycopg2 import connect

from auth import create_access_token, get_current_user, hash_password, require_admin, require_customer, require_employee, verify_password
from auth_models import AuthenticatedUser, CurrentCustomerResponse, CurrentEmployeeResponse, CustomerLoginRequest, CustomerRegisterRequest, EmployeeLoginRequest, TokenResponse, TokenUser
from data_models import Address, Booking, Employee, Hotel, HotelChain, Renting, Room


app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.getenv("DATABASE_URL")
DB_NAME = os.getenv("DB_NAME", "ehoteldb")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_USER = os.getenv("DB_USER", "public")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")


def query_db_from_sql_file(file_path: str, params: Any = (), user: str = "public", password: str = "", host="localhost", port=5432):
    # Resolve SQL files relative to the backend package so imports work from any cwd.
    with open(BASE_DIR / file_path, "r") as f:
        query = f.read()

    return query_db(query, params, user, password, host, port)


def query_db(query: str, params: Any = (), user: str = "public", password: str = "", host="localhost", port=5432):
    # Prefer DATABASE_URL when provided, but keep explicit params/env fallbacks for local use.
    connection_kwargs = {
        "dbname": DB_NAME,
        "user": user or DB_USER,
        "password": password or DB_PASSWORD,
        "host": host or DB_HOST,
        "port": port or DB_PORT,
    }
    connect_args = (DATABASE_URL,) if DATABASE_URL else ()
    if DATABASE_URL:
        connection_kwargs = {}

    with connect(*connect_args, **connection_kwargs) as conn:
        df = pd.read_sql_query(query, conn, params=params)

    return df.to_dict(orient="records")


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
            city=row.pop("city"),
            street_address=row.pop("street_address"),
            country=row.pop("country")
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
            city=row.pop("city"),
            street_address=row.pop("street_address"),
            country=row.pop("country")
        )

    return [Hotel(**row) for row in res]


@app.get("/hotels/{hotel_id}")
def get_hotel_details(hotel_id: int) -> Hotel:
    res = query_db_from_sql_file(
        "queries/hotel_details.sql",
        {"hid": hotel_id}
    )

    if len(res) == 0:
        raise HTTPException(status_code=404, detail="Hotel not found")

    row = res[0]
    row["address"] = Address(
        city=row.pop("city"),
        street_address=row.pop("street_address"),
        country=row.pop("country")
    )
    row["email_addresses"] = parse_pg_array(row.pop("email_address", None))

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
        raise HTTPException(status_code=404, detail="Room not found")

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
        raise HTTPException(status_code=403, detail="Forbidden")

    res = query_db_from_sql_file(
        "queries/bookings_for_customer.sql" if not archived else "queries/archived_bookings_for_customer.sql",
        {"customer_id": customer_id},
    )

    return [Booking(**row) for row in res]


@app.get("/{customer_id}/bookings/{booking_id}")
def get_booking_details(customer_id: str, booking_id: int, current_user: AuthenticatedUser = Depends(require_customer)) -> Booking:
    if current_user.actor_id != customer_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    res = query_db_from_sql_file(
        "queries/booking_details.sql",
        {"ref_id": booking_id},
    )

    if len(res) == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = Booking(**res[0])
    
    if booking.customer_id != customer_id:
        # return 403 forbidden
        raise HTTPException(status_code=403, detail="Forbidden")

    return booking


## Employee APIs - require authentication

@app.get("/employee/hotels/{hotel_id}/bookings")
def get_hotel_bookings(hotel_id: int, archived: bool, current_user: AuthenticatedUser = Depends(require_employee)) -> list[Booking]:
    res = query_db_from_sql_file(
        "queries/all_bookings_for_hotel.sql" if not archived else "queries/all_archived_bookings_for_hotel.sql",
        {"hid": hotel_id},
    )
    
    return [Booking(**row) for row in res]


@app.get("/employee/hotels/{hotel_id}/rentings")
def get_hotel_rentings(hotel_id: int, archived: bool, current_user: AuthenticatedUser = Depends(require_employee)) -> list[Renting]:
    res = query_db_from_sql_file(
        "queries/all_rentings_for_hotel.sql" if not archived else "queries/all_archived_rentings_for_hotel.sql",
        {"hid": hotel_id},
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
@app.get("/admin/hotel_chains")
def get_hotel_chains(current_user: AuthenticatedUser = Depends(require_admin)) -> list[HotelChain]:
    res = query_db_from_sql_file(
        "queries/all_hotel_chains.sql",
    )

    for row in res:
        row["email_addresses"] = parse_pg_array(row.get("email_addresses"))

    return [HotelChain(**row) for row in res]


@app.post("/admin/hotel_chains/new")
def create_hotel_chain(name: str, address: str, phone_number: str, email_addresses: list[str], current_user: AuthenticatedUser = Depends(require_admin)) -> str:
    pass


@app.put("/admin/hotel_chains/{chain_name}/manage")
def edit_hotel_chain(chain_name: str, current_user: AuthenticatedUser = Depends(require_admin), name: str = None, address: str = None, phone_number: str = None, email_addresses: list[str] = None) -> str:
    pass


@app.delete("/admin/hotel_chains/{chain_name}/delete")
def delete_hotel_chain(chain_name: str, current_user: AuthenticatedUser = Depends(require_admin)):
    pass


@app.get("/admin/hotel_chains/{chain_name}/hotels")
def get_hotels_in_chain(chain_name: str, current_user: AuthenticatedUser = Depends(require_admin)) -> list[Hotel]:
    res = query_db_from_sql_file(
        "queries/all_hotels_in_chain.sql",
        {"chain_name": chain_name},
    )

    for row in res:
        row["address"] = Address(
            city=row.pop("city"),
            street_address=row.pop("street_address"),
            country=row.pop("country")
        )
        row["email_addresses"] = parse_pg_array(row.get("email_addresses"))

    return [Hotel(**row) for row in res]


@app.post("/admin/hotel_chains/{chain_name}/hotels/new")
def create_hotel_in_chain(chain_name: str, name: str, rating: int, city: str, street_address: str, country: str, image: str, phone_number: str, email_addresses: list[str], current_user: AuthenticatedUser = Depends(require_admin)) -> int:
    pass


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/manage")
def edit_hotel_in_chain(chain_name: str, hotel_id: int, current_user: AuthenticatedUser = Depends(require_admin), name: str = None, rating: int = None, city: str = None, street_address: str = None, country: str = None, image: str = None, phone_number: str = None, email_addresses: list[str] = None) -> int:
    pass


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/delete")
def delete_hotel_in_chain(chain_name: str, hotel_id: int, current_user: AuthenticatedUser = Depends(require_admin)):
    pass


@app.get("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms")
def get_rooms_in_hotel(hotel_id: int, current_user: AuthenticatedUser = Depends(require_admin)) -> list[Room]:
    res = query_db_from_sql_file(
        "queries/all_rooms_for_hotel.sql",
        {"hid": hotel_id},
    )

    for row in res:
        row["amenities"] = parse_pg_array(row.get("amenities"))

    return [Room(**row) for row in res]


@app.post("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms/new")
def create_room_in_hotel(chain_name: str, hotel_id: int, room_number: int, capacity: Literal[1, 2, 3, 4], view: str, price: float, problem: str, extendable: bool, amenities: list[str], current_user: AuthenticatedUser = Depends(require_admin)) -> int:
    pass


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms/{room_number}/manage")
def edit_room_in_hotel(chain_name: str, hotel_id: int, room_number: int, current_user: AuthenticatedUser = Depends(require_admin), new_room_number: int = None, capacity: Literal[1, 2, 3, 4] = None, view: str = None, price: float = None, problem: str = None, extendable: bool = None, amenities: list[str] = None) -> int:
    pass


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms/{room_number}/delete")
def delete_room_in_hotel(chain_name: str, hotel_id: int, room_number: int, current_user: AuthenticatedUser = Depends(require_admin)):
    pass


@app.get("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees")
def get_employees_in_hotel(hotel_id: int, current_user: AuthenticatedUser = Depends(require_admin)) -> list[Employee]:
    res = query_db_from_sql_file(
        "queries/all_employees_of_hotel.sql",
        {"hid": hotel_id},
    )

    return [Employee(**row) for row in res]


@app.post("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/new")
def create_employee_in_hotel(chain_name: str, hotel_id: int, first_name: str, last_name: str, password: str, role: str, address: str, current_user: AuthenticatedUser = Depends(require_admin)) -> int:
    pass


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/{employee_id}/manage")
def edit_employee_in_hotel(chain_name: str, hotel_id: int, employee_id: int, current_user: AuthenticatedUser = Depends(require_admin), first_name: str = None, last_name: str = None, password: str = None, role: str = None, address: str = None) -> int:
    pass


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/{employee_id}/delete")
def delete_employee_in_hotel(chain_name: str, hotel_id: int, employee_id: int, current_user: AuthenticatedUser = Depends(require_admin)):
    pass
