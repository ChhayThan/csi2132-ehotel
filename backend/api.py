# api to query the database server

from datetime import date
import pandas as pd
from typing_extensions import Literal

from fastapi import FastAPI, HTTPException
from psycopg2 import connect

from data_models import Address, Booking, Employee, Hotel, HotelChain, Renting, Room


app = FastAPI()


def query_db_from_sql_file(file_path: str, params: tuple | dict = (), user: str = "public", password: str = "", host="localhost", port=5432):
    with open(file_path, "r") as f:
        query = f.read()

    return query_db(query, params, user, password, host, port)


def query_db(query: str, params: tuple | dict = (), user: str = "public", password: str = "", host="localhost", port=5432):
    with connect(
        dbname="ehoteldb",
        user=user,
        password=password,
        host=host,
        port=port
    ) as conn:
        df = pd.read_sql_query(query, conn, params=params)

    return df.to_dict(orient="records")


def user_from_token(token: str) -> int:
    """Returns user id from token"""
    pass


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

    return Hotel(**row)


@app.get("/hotels/{hotel_id}/rooms/available")
def get_available_rooms(hotel_id: int, checkin_date: date, checkout_date: date) -> list[Room]:
    res = query_db_from_sql_file(
        "queries/available_rooms_for_hotel.sql",
        {"hid": hotel_id, "checkin_date": checkin_date, "checkout_date": checkout_date}
    )

    return [Room(**row) for row in res]


@app.get("/hotels/{hotel_id}/rooms/{room_number}")
def get_room_details(hotel_id: int, room_number: int) -> Room:
    res = query_db_from_sql_file(
        "queries/room_details.sql",
        {"hid": hotel_id, "room_number": room_number}
    )

    if len(res) == 0:
        raise HTTPException(status_code=404, detail="Room not found")

    return Room(**res[0])


@app.post("/auth/login")
def login(email: str, password: str) -> str:
    """Returns token"""
    pass


@app.post("/auth/register")
def register(email: str, password: str, first_name: str, last_name: str, drivers_license: str) -> str:
    """Returns token"""
    pass


## Customer APIs - require authentication

@app.get("/{customer_id}/bookings")
def get_bookings(customer_id: int, archived: bool, token: str) -> list[Booking]:
    # get user id from token
    user = user_from_token(token)

    if user != customer_id:
        # return 403 forbidden
        raise HTTPException(status_code=403, detail="Forbidden")

    res = query_db_from_sql_file(
        "queries/bookings_for_customer.sql" if not archived else "queries/archived_bookings_for_customer.sql",
        {"customer_id": customer_id},
        user=user
    )

    return [Booking(**row) for row in res]


@app.get("/{customer_id}/bookings/{booking_id}")
def get_booking_details(customer_id: int, booking_id: int, token: str) -> Booking:
    # get user id from token
    user = user_from_token(token)

    if user != customer_id:
        # return 403 forbidden
        raise HTTPException(status_code=403, detail="Forbidden")

    res = query_db_from_sql_file(
        "queries/booking_details.sql",
        {"ref_id": booking_id},
        user=user
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
def get_hotel_bookings(hotel_id: int, archived: bool, token: str) -> list[Booking]:
    user = user_from_token(token)

    res = query_db_from_sql_file(
        "queries/all_bookings_for_hotel.sql" if not archived else "queries/all_archived_bookings_for_hotel.sql",
        {"hid": hotel_id},
        user=user
    )
    
    return [Booking(**row) for row in res]


@app.get("/employee/hotels/{hotel_id}/rentings")
def get_hotel_rentings(hotel_id: int, archived: bool, token: str) -> list[Renting]:
    user = user_from_token(token)

    res = query_db_from_sql_file(
        "queries/all_rentings_for_hotel.sql" if not archived else "queries/all_archived_rentings_for_hotel.sql",
        {"hid": hotel_id},
        user=user
    )

    return [Renting(**row) for row in res]


@app.post("/employee/login")
def employee_login(employee_id: int, password: str) -> str:
    """Returns token"""
    pass


## Admin APIs - require authentication
@app.get("/admin/hotel_chains")
def get_hotel_chains(token: str) -> list[HotelChain]:
    user = user_from_token(token)

    res = query_db_from_sql_file(
        "queries/all_hotel_chains.sql",
        user=user
    )

    return [HotelChain(**row) for row in res]


@app.post("/admin/hotel_chains/new")
def create_hotel_chain(name: str, address: str, phone_number: str, email_addresses: list[str], token: str) -> str:
    pass


@app.put("/admin/hotel_chains/{chain_name}/manage")
def edit_hotel_chain(chain_name: str, token: str, name: str = None, address: str = None, phone_number: str = None, email_addresses: list[str] = None) -> str:
    pass


@app.delete("/admin/hotel_chains/{chain_name}/delete")
def delete_hotel_chain(chain_name: str, token: str):
    pass


@app.get("/admin/hotel_chains/{chain_name}/hotels")
def get_hotels_in_chain(chain_name: str, token: str) -> list[Hotel]:
    user = user_from_token(token)

    res = query_db_from_sql_file(
        "queries/all_hotels_in_chain.sql",
        {"chain_name": chain_name},
        user=user
    )

    for row in res:
        row["address"] = Address(
            city=row.pop("city"),
            street_address=row.pop("street_address"),
            country=row.pop("country")
        )

    return [Hotel(**row) for row in res]


@app.post("/admin/hotel_chains/{chain_name}/hotels/new")
def create_hotel_in_chain(chain_name: str, name: str, rating: int, city: str, street_address: str, country: str, image: str, phone_number: str, email_addresses: list[str], token: str) -> int:
    pass


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/manage")
def edit_hotel_in_chain(chain_name: str, hotel_id: int, token: str, name: str = None, rating: int = None, city: str = None, street_address: str = None, country: str = None, image: str = None, phone_number: str = None, email_addresses: list[str] = None) -> int:
    pass


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/delete")
def delete_hotel_in_chain(chain_name: str, hotel_id: int, token: str):
    pass


@app.get("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms")
def get_rooms_in_hotel(hotel_id: int, token: str) -> list[Room]:
    user = user_from_token(token)

    res = query_db_from_sql_file(
        "queries/all_rooms_for_hotel.sql",
        {"hid": hotel_id},
        user=user
    )

    return [Room(**row) for row in res]


@app.post("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms/new")
def create_room_in_hotel(chain_name: str, hotel_id: int, room_number: int, capacity: Literal[1, 2, 3, 4], view: str, price: float, problem: str, extendable: bool, amenities: list[str], token: str) -> int:
    pass


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms/{room_number}/manage")
def edit_room_in_hotel(chain_name: str, hotel_id: int, room_number: int, token: str, new_room_number: int = None, capacity: Literal[1, 2, 3, 4] = None, view: str = None, price: float = None, problem: str = None, extendable: bool = None, amenities: list[str] = None) -> int:
    pass


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms/{room_number}/delete")
def delete_room_in_hotel(chain_name: str, hotel_id: int, room_number: int, token: str):
    pass


@app.get("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees")
def get_employees_in_hotel(hotel_id: int, token: str) -> list[Employee]:
    user = user_from_token(token)
    
    res = query_db_from_sql_file(
        "queries/all_employees_of_hotel.sql",
        {"hid": hotel_id},
        user=user
    )

    return [Employee(**row) for row in res]


@app.post("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/new")
def create_employee_in_hotel(chain_name: str, hotel_id: int, first_name: str, last_name: str, password: str, role: str, address: str, token: str) -> int:
    pass


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/{employee_id}/manage")
def edit_employee_in_hotel(chain_name: str, hotel_id: int, employee_id: int, token: str, first_name: str = None, last_name: str = None, password: str = None, role: str = None, address: str = None) -> int:
    pass


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/{employee_id}/delete")
def delete_employee_in_hotel(chain_name: str, hotel_id: int, employee_id: int, token: str):
    pass
