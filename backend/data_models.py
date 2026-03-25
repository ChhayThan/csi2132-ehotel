from datetime import date
from typing import Literal

from pydantic import BaseModel


class Address(BaseModel):
	city: str
	street_address: str
	country: str


class Hotel(BaseModel):
    hid: int
    name: str
    rating: int
    address: Address
    image: str | None = None
    chain_name: str
    min_price: float | None = None
    num_available_rooms: int | None = None
    phone_number: str
    email_addresses: list[str] | None = None


class Room(BaseModel):
    hid: int
    room_number: int
    capacity: Literal[1, 2, 3, 4]
    view: str
    price: float
    problem: str
    extendable: bool
    amenities: list[str] | None = None
    image: str | None = None


class Booking(BaseModel):
    ref_id: int
    hid: int
    room_number: int
    customer_id: int
    creation_date: date
    checkin_date: date
    checkout_date: date


class Renting(BaseModel):
    ref_id: int
    hid: int
    room_number: int
    customer_id: int
    employee_id: int
    creation_date: date
    checkin_date: date
    checkout_date: date
    payment_type: str
    payment_amount: float


class HotelChain(BaseModel):
    name: str
    address: str
    phone_number: str
    email_addresses: list[str] | None = None
    num_hotels: int


class Employee(BaseModel):
    id: int
    first_name: str
    last_name: str
    role: str
    address: str
