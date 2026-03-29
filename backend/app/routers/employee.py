from fastapi import APIRouter, Depends

from ..constants import WEBSERVER_EMPLOYEE_USER_PASSWORD, WS_EMPLOYEE_USER

from ..auth import require_employee
from ..models.data_models import Booking, Renting
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
