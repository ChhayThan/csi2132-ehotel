# api to query the database server

from datetime import date
from typing_extensions import Literal

from fastapi import FastAPI
from psycopg2 import connect

from data_models import Booking, Employee, Hotel, HotelChain, Renting, Room


app = FastAPI()


def query_db(query: str, params: tuple = (), user: str = "public", password: str = ""):
    with connect(
        dbname="ehotel",
        user=user,
        password=password,
        host="localhost",
        port=5432
    ) as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()


## Public APIs - no authentication

@app.get("/hotels/available")
def get_hotels(city: str = None, checkin_date: date = None, checkout_date: date = None) -> list[Hotel]:
    pass


@app.get("/hotels/top")
def get_top_hotels(limit: int = 10) -> list[Hotel]:
    pass


@app.get("/hotels/{hotel_id}")
def get_hotel_details(hotel_id: int) -> Hotel:
    pass


@app.get("/hotels/{hotel_id}/rooms/available")
def get_available_rooms(hotel_id: int, checkin_date: date, checkout_date: date) -> list[Room]:
    pass


@app.get("/hotels/{hotel_id}/rooms/{room_number}")
def get_room_details(hotel_id: int, room_number: int) -> Room:
    pass


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
    pass


@app.get("/{customer_id}/bookings/{booking_id}")
def get_booking_details(customer_id: int, booking_id: int, token: str) -> Booking:
    pass


## Employee APIs - require authentication

@app.get("/employee/hotels/{hotel_id}/bookings")
def get_hotel_bookings(hotel_id: int, archived: bool, token: str) -> list[Booking]:
    pass


@app.get("/employee/hotels/{hotel_id}/rentings")
def get_hotel_rentings(hotel_id: int, archived: bool, token: str) -> list[Renting]:
    pass


@app.post("/employee/login")
def employee_login(employee_id: int, password: str) -> str:
    """Returns token"""
    pass


## Admin APIs - require authentication
@app.get("/admin/hotel_chains")
def get_hotel_chains(username: str, password: str) -> list[HotelChain]:
    pass


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
    pass


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
def get_rooms_in_hotel(chain_name: str, hotel_id: int, token: str) -> list[Room]:
    pass


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
def get_employees_in_hotel(chain_name: str, hotel_id: int, token: str) -> list[Employee]:
    pass


@app.post("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/new")
def create_employee_in_hotel(chain_name: str, hotel_id: int, first_name: str, last_name: str, password: str, role: str, address: str, token: str) -> int:
    pass


@app.put("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/{employee_id}/manage")
def edit_employee_in_hotel(chain_name: str, hotel_id: int, employee_id: int, token: str, first_name: str = None, last_name: str = None, password: str = None, role: str = None, address: str = None) -> int:
    pass


@app.delete("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees/{employee_id}/delete")
def delete_employee_in_hotel(chain_name: str, hotel_id: int, employee_id: int, token: str):
    pass
