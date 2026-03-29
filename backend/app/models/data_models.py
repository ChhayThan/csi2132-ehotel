from datetime import date
from typing import Literal

from pydantic import BaseModel


class Address(BaseModel):
	city: str
	street_address: str
	country: str


class AddressPartial(BaseModel):
    city: str | None = None
    street_address: str | None = None
    country: str | None = None


class HotelUserDefined(BaseModel):
    name: str
    rating: int
    address: Address
    image: str | None = None
    phone_number: str
    email_addresses: list[str] | None = None
    manager_eid: int


class HotelPartial(BaseModel):
    name: str | None = None
    rating: int | None = None
    address: AddressPartial
    image: str | None = None
    phone_number: str | None = None
    email_addresses: list[str] | None = None
    manager_eid: int | None = None


class Hotel(HotelUserDefined):
    hid: int
    chain_name: str
    min_price: float | None = None
    num_available_rooms: int | None = None
    manager_eid: int | None = None


class RoomUserDefined(BaseModel):
    room_number: int
    capacity: Literal[1, 2, 4]
    view: str
    price: float
    problem: str
    extendable: bool
    amenities: list[str] | None = None
    image: str | None = None


class RoomPartial(BaseModel):
    room_number: int | None = None
    capacity: Literal[1, 2, 4] | None = None
    view: str | None = None
    price: float | None = None
    problem: str | None = None
    extendable: bool | None = None
    amenities: list[str] | None = None
    image: str | None = None


class Room(RoomUserDefined):
    hid: int


class BookingUserDefined(BaseModel):
    hid: int
    room_number: int
    checkin_date: date
    checkout_date: date


class Booking(BookingUserDefined):
    ref_id: int
    customer_id: str
    creation_date: date


class Renting(BaseModel):
    ref_id: int
    hid: int
    room_number: int
    customer_id: str
    employee_id: int
    creation_date: date
    checkin_date: date
    checkout_date: date
    payment_type: str
    payment_amount: float


class PartialHotelChain(BaseModel):
    name: str | None = None
    address: str | None = None
    phone_number: str | None = None
    email_addresses: list[str] | None = None


class HotelChainUserDefined(BaseModel):
    name: str
    address: str
    phone_number: str
    email_addresses: list[str] | None = None


class HotelChain(HotelChainUserDefined):
    num_hotels: int


class Employee(BaseModel):
    id: int
    first_name: str
    last_name: str
    role: Literal["employee", "admin"]
    address: str


class EmployeePartial(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    role: Literal["employee", "admin"] | None = None
    address: str | None = None
