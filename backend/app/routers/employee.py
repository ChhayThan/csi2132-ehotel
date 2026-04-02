from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg2.errors import ForeignKeyViolation, IntegrityError, UniqueViolation

from ..constants import WEBSERVER_EMPLOYEE_USER_PASSWORD, WS_EMPLOYEE_USER

from ..auth import require_employee
from ..models.auth_models import AuthenticatedUser
from ..models.data_models import Booking, PaymentType, Renting, RentingFromBookingRequest, RentingUserDefined
from ..session import query_db_from_sql_file


router = APIRouter(prefix="/employee", tags=["employee"], dependencies=[Depends(require_employee)])


@router.get("/hotels/{hotel_id}/bookings")
def get_hotel_bookings(hotel_id: int, archived: bool) -> list[Booking]:
    res = query_db_from_sql_file(
        "queries/all_bookings_for_hotel.sql" if not archived else "queries/all_archived_bookings_for_hotel.sql",
        {"hid": hotel_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )
    
    return [Booking(**row) for row in res]


@router.get("/hotels/{hotel_id}/rentings")
def get_hotel_rentings(hotel_id: int, archived: bool) -> list[Renting]:
    res = query_db_from_sql_file(
        "queries/all_rentings_for_hotel.sql" if not archived else "queries/all_archived_rentings_for_hotel.sql",
        {"hid": hotel_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )

    return [Renting(**row) for row in res]


@router.post("/rentings/convert", status_code=status.HTTP_201_CREATED)
def create_renting_from_booking(payload: RentingFromBookingRequest, employee: AuthenticatedUser = Depends(require_employee)) -> int:
    res = query_db_from_sql_file(
        "queries/booking_details.sql",
        {"ref_id": payload.booking_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
	)
    
    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    booking = Booking(**res[0])

    try:
        res = query_db_from_sql_file(
            "queries/modify/create_renting.sql",
            {
                "hid": booking.hid,
                "room_number": booking.room_number,
                "customer_id": booking.customer_id,
                "employee_id": employee.actor_id,
                "creation_date": date.today(),
                "checkin_date": booking.checkin_date,
                "checkout_date": booking.checkout_date,
                "payment_type": payload.payment_type,
                "payment_amount": payload.payment_amount,
                "booking_id": booking.ref_id,
                "booking_creation_date": booking.creation_date,
            },
            user=WS_EMPLOYEE_USER,
            password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
        )
    except UniqueViolation as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Conflicting booking or renting for dates")
    except IntegrityError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment information")

    return res[0]["ref_id"]


@router.post("/rentings/new", status_code=status.HTTP_201_CREATED)
def create_renting(renting: RentingUserDefined, employee: AuthenticatedUser = Depends(require_employee)) -> int:
    try:
        res = query_db_from_sql_file(
            "queries/modify/create_renting.sql",
            {
                "hid": renting.hid,
                "room_number": renting.room_number,
                "customer_id": renting.customer_id,
                "employee_id": employee.actor_id,
                "creation_date": date.today(),
                "checkin_date": renting.checkin_date,
                "checkout_date": renting.checkout_date,
                "payment_type": renting.payment_type,
                "payment_amount": renting.payment_amount,
                "booking_id": None,
                "booking_creation_date": None,
            },
            user=WS_EMPLOYEE_USER,
            password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
        )
    except ForeignKeyViolation as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel, room, or customer not found")
    except UniqueViolation as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Conflicting booking or renting for dates")
    except IntegrityError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment information")

    return res[0]["ref_id"]


@router.delete("/rentings/{renting_id}/delete")
def delete_renting(renting_id: int) -> Renting:
    res = query_db_from_sql_file(
        "queries/renting_details.sql",
        {"ref_id": renting_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Renting not found")
    
    renting = Renting(ref_id=renting_id, **res[0])

    query_db_from_sql_file(
        "queries/modify/delete_renting.sql",
        {"ref_id": renting_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )

    return renting
