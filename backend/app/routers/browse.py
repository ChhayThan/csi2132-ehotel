from datetime import date

from fastapi import APIRouter, HTTPException, status

from ..session import parse_pg_array, query_db_from_sql_file
from ..models.data_models import Address, Hotel, Room


router = APIRouter(prefix="/hotels", tags=["public"])


@router.get("/available")
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


@router.get("/top")
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


@router.get("/{hotel_id}")
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


@router.get("/{hotel_id}/rooms/available")
def get_available_rooms(hotel_id: int, checkin_date: date, checkout_date: date) -> list[Room]:
    res = query_db_from_sql_file(
        "queries/available_rooms_for_hotel.sql",
        {"hid": hotel_id, "checkin_date": checkin_date, "checkout_date": checkout_date}
    )

    for row in res:
        row["amenities"] = parse_pg_array(row.get("amenities"))

    return [Room(**row) for row in res]


@router.get("/{hotel_id}/rooms/{room_number}")
def get_room_details(hotel_id: int, room_number: int) -> Room:
    res = query_db_from_sql_file(
        "queries/room_details.sql",
        {"hid": hotel_id, "room_number": room_number}
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    res[0]["amenities"] = parse_pg_array(res[0].get("amenities"))

    return Room(**res[0])


@router.get("/num_rooms")
def get_number_of_rooms_for_city(city: str | None = None) -> int | list[dict[str, int]]:
    '''Return the total number of rooms for all hotels in the city 
    or a list of aggregated room counts for all cities if no city provided'''

    if city:
        res = query_db_from_sql_file(
            "queries/num_rooms_for_city.sql",
            {"city": city},
        )

        if len(res) == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No city with name {city}")
        
        return res[0]["num_rooms"]
    
    else:
        res = query_db_from_sql_file(
            "queries/num_rooms_by_city.sql"
        )

        return res
