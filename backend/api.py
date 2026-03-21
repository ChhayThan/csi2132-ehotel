# api to query the database server

from datetime import date

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


## Customer APIs - require authentication

@app.get("/{customer_id}/bookings")
def get_bookings(customer_id: int, archived: bool, username: str, password: str) -> list[Booking]:
    pass


@app.get("/{customer_id}/bookings/{booking_id}")
def get_booking_details(customer_id: int, booking_id: int, username: str, password: str) -> Booking:
    pass


## Employee APIs - require authentication

@app.get("/employee/hotels/{hotel_id}/bookings")
def get_hotel_bookings(hotel_id: int, archived: bool, username: str, password: str) -> list[Booking]:
    pass


@app.get("/employee/hotels/{hotel_id}/rentings")
def get_hotel_rentings(hotel_id: int, archived: bool, username: str, password: str) -> list[Renting]:
    pass


## Admin APIs - require authentication
@app.get("/admin/hotel_chains")
def get_hotel_chains(username: str, password: str) -> list[HotelChain]:
    pass


@app.get("/admin/hotel_chains/{chain_name}/hotels")
def get_hotels_in_chain(chain_name: str, username: str, password: str) -> list[Hotel]:
    pass


@app.get("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/rooms")
def get_rooms_in_hotel(chain_name: str, hotel_id: int, username: str, password: str) -> list[Room]:
    pass


@app.get("/admin/hotel_chains/{chain_name}/hotels/{hotel_id}/employees")
def get_employees_in_hotel(chain_name: str, hotel_id: int, username: str, password: str) -> list[Employee]:
    pass
