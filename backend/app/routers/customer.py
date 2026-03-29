from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg2.errors import ForeignKeyViolation, UniqueViolation, IntegrityError

from ..constants import WEBSERVER_CUSTOMER_USER_PASSWORD, WS_CUSTOMER_USER

from ..auth import require_customer
from ..models.auth_models import AuthenticatedUser
from ..models.data_models import Booking, BookingUserDefined
from ..session import query_db_from_sql_file


router = APIRouter(tags=["customer"], dependencies=[])


@router.get("/{customer_id}/bookings")
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


@router.get("/{customer_id}/bookings/{booking_id}")
def get_booking_details(customer_id: str, booking_id: int, current_user: AuthenticatedUser = Depends(require_customer)) -> Booking:
    if current_user.actor_id != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    res = query_db_from_sql_file(
        "queries/booking_details.sql",
        {"ref_id": booking_id},
        user=WS_CUSTOMER_USER,
        password=WEBSERVER_CUSTOMER_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    booking = Booking(**res[0])

    if booking.customer_id != customer_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    return booking


@router.post("/{customer_id}/bookings/new", status_code=status.HTTP_201_CREATED)
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


@router.delete("/{customer_id}/bookings/{booking_id}/cancel")
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
