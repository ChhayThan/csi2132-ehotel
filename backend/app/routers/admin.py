from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg2.errors import ForeignKeyViolation, UniqueViolation, IntegrityError

from ..constants import WEBSERVER_ADMIN_USER_PASSWORD, WS_ADMIN_USER

from ..auth import hash_password, require_admin
from ..models.auth_models import EmployeeCreationRequest
from ..models.data_models import (
    Address,
    Employee,
    EmployeePartial,
    Hotel,
    HotelChain,
    HotelChainUserDefined,
    HotelPartial,
    HotelUserDefined,
    PartialHotelChain,
    Room,
    RoomPartial,
    RoomUserDefined
)
from ..session import execute_multiple_from_sql_files, parse_pg_array, query_db_from_sql_file


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


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


@router.get("/hotel_chains")
def get_hotel_chains() -> list[HotelChain]:
    res = query_db_from_sql_file(
        "queries/all_hotel_chains.sql",
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    for row in res:
        row["email_addresses"] = parse_pg_array(row.get("email_addresses"))

    return [HotelChain(**row) for row in res]


@router.post("/hotel_chains/new", status_code=status.HTTP_201_CREATED)
def create_hotel_chain(hotel_chain: HotelChainUserDefined) -> str:
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


@router.put("/hotel_chains/{chain_name}/manage")
def edit_hotel_chain(chain_name: str, new_hotel_chain: PartialHotelChain) -> str:
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


@router.delete("/hotel_chains/{chain_name}/delete")
def delete_hotel_chain(chain_name: str) -> HotelChain:
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


@router.get("/hotel_chains/{chain_name}/hotels")
def get_hotels_in_chain(chain_name: str) -> list[Hotel]:
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


@router.post("/hotels/new", status_code=status.HTTP_201_CREATED)
def create_hotel_in_chain(chain_name: str, hotel: HotelUserDefined) -> int:
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


@router.put("/hotels/{hotel_id}/manage")
def edit_hotel_in_chain(hotel_id: int, new_hotel: HotelPartial) -> int:
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


@router.delete("/hotels/{hotel_id}/delete")
def delete_hotel_in_chain(hotel_id: int) -> Hotel:
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


@router.get("/hotels/{hotel_id}/rooms")
def get_rooms_in_hotel(hotel_id: int) -> list[Room]:
    res = query_db_from_sql_file(
        "queries/all_rooms_for_hotel.sql",
        {"hid": hotel_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    for row in res:
        row["amenities"] = parse_pg_array(row.get("amenities"))

    return [Room(**row) for row in res]


@router.post("/hotels/{hotel_id}/rooms/new", status_code=status.HTTP_201_CREATED)
def create_room_in_hotel(hotel_id: int, room: RoomUserDefined) -> int:
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


@router.put("/hotels/{hotel_id}/rooms/{room_number}/manage")
def edit_room_in_hotel(hotel_id: int, room_number: int, new_room: RoomPartial) -> int:
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


@router.delete("/hotels/{hotel_id}/rooms/{room_number}/delete")
def delete_room_in_hotel(hotel_id: int, room_number: int):
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


@router.get("/hotel_chains/{chain_name}/hotels/{hotel_id}/employees")
def get_employees_in_hotel(hotel_id: int) -> list[Employee]:
    res = query_db_from_sql_file(
        "queries/all_employees_of_hotel.sql",
        {"hid": hotel_id},
        user=WS_ADMIN_USER,
        password=WEBSERVER_ADMIN_USER_PASSWORD,
    )

    return [Employee(**row) for row in res]


@router.post("/employees/new", status_code=status.HTTP_201_CREATED)
def create_employee_in_hotel(hotel_id: int, employee: EmployeeCreationRequest) -> int:
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


@router.put("/employees/{employee_id}/manage")
def edit_employee_in_hotel(employee_id: int, new_employee: EmployeePartial) -> int:
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


@router.delete("/employees/{employee_id}/delete")
def delete_employee_in_hotel(employee_id: int) -> Employee:
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

