from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from psycopg2.errors import ForeignKeyViolation, IntegrityError, UniqueViolation

from ..constants import DB_HOST, DB_PORT, WEBSERVER_AUTH_USER_PASSWORD, WEBSERVER_EMPLOYEE_USER_PASSWORD, WS_AUTH_USER, WS_EMPLOYEE_USER

from ..auth import hash_password, require_employee
from ..models.auth_models import AuthenticatedUser, EmployeeCustomerLookupResponse
from ..models.data_models import ArchivedRenting, Booking, EmployeeDirectRentingRequest, PaymentType, Renting, RentingFromBookingRequest, RentingUserDefined
from ..session import query_db_from_sql_file


router = APIRouter(prefix="/employee", tags=["employee"], dependencies=[Depends(require_employee)])


def query_db_as_auth_user(file_path: str, params: dict | None = None) -> list[dict]:
    return query_db_from_sql_file(
        file_path,
        params or {},
        host=DB_HOST,
        port=DB_PORT,
        user=WS_AUTH_USER,
        password=WEBSERVER_AUTH_USER_PASSWORD,
    )


def get_employee_hotel_id(employee: AuthenticatedUser) -> int:
    employee_rows = query_db_as_auth_user(
        "queries/auth/get_employee_by_id.sql",
        {"employee_id": int(employee.actor_id)},
    )

    if len(employee_rows) == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Employee not found")

    return int(employee_rows[0]["hid"])


def ensure_employee_hotel_access(hotel_id: int, employee: AuthenticatedUser) -> None:
    if get_employee_hotel_id(employee) != hotel_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Hotel access denied")


@router.get("/hotels/{hotel_id}/bookings")
def get_hotel_bookings(hotel_id: int, archived: bool, employee: AuthenticatedUser = Depends(require_employee)) -> list[Booking]:
    ensure_employee_hotel_access(hotel_id, employee)

    res = query_db_from_sql_file(
        "queries/all_bookings_for_hotel.sql" if not archived else "queries/all_archived_bookings_for_hotel.sql",
        {"hid": hotel_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )
    
    return [Booking(**row) for row in res]


@router.get("/hotels/{hotel_id}/rentings")
def get_hotel_rentings(hotel_id: int, archived: bool, employee: AuthenticatedUser = Depends(require_employee)) -> list[Renting] | list[ArchivedRenting]:
    ensure_employee_hotel_access(hotel_id, employee)

    res = query_db_from_sql_file(
        "queries/all_rentings_for_hotel.sql" if not archived else "queries/all_archived_rentings_for_hotel.sql",
        {"hid": hotel_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )

    if archived:
        return [ArchivedRenting(**row) for row in res]

    return [Renting(**row) for row in res]


@router.get("/customers/by-email", response_model=EmployeeCustomerLookupResponse)
def get_customer_by_email(email: str = Query(...), employee: AuthenticatedUser = Depends(require_employee)) -> EmployeeCustomerLookupResponse:
    get_employee_hotel_id(employee)

    customer_rows = query_db_as_auth_user(
        "queries/auth/get_customer_by_email.sql",
        {"email": email.strip()},
    )

    if len(customer_rows) == 0:
        return EmployeeCustomerLookupResponse(exists=False)

    customer = customer_rows[0]
    return EmployeeCustomerLookupResponse(
        exists=True,
        id=customer["id"],
        email=customer["email_address"],
        first_name=customer["first_name"],
        last_name=customer["last_name"],
        address=customer["address"],
    )


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

    ensure_employee_hotel_access(booking.hid, employee)

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


@router.post("/rentings/direct", status_code=status.HTTP_201_CREATED)
def create_direct_renting(payload: EmployeeDirectRentingRequest, employee: AuthenticatedUser = Depends(require_employee)) -> int:
    ensure_employee_hotel_access(payload.hid, employee)

    customer_payload = payload.customer
    existing_customer_rows = query_db_as_auth_user(
        "queries/auth/get_customer_by_email.sql",
        {"email": customer_payload.email.strip()},
    )

    if len(existing_customer_rows) > 0:
        customer_id = existing_customer_rows[0]["id"]
    else:
        missing_fields = [
            field_name
            for field_name, value in (
                ("first_name", customer_payload.first_name),
                ("last_name", customer_payload.last_name),
                ("drivers_license", customer_payload.drivers_license),
                ("address", customer_payload.address),
                ("password", customer_payload.password),
            )
            if not value or not str(value).strip()
        ]

        if len(missing_fields) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer does not exist. Missing required customer fields: {', '.join(missing_fields)}",
            )

        customer_id = customer_payload.drivers_license.strip()
        existing_customer_id_rows = query_db_as_auth_user(
            "queries/auth/get_customer_by_id.sql",
            {"customer_id": customer_id},
        )

        if len(existing_customer_id_rows) > 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Drivers license already registered")

        query_db_as_auth_user(
            "queries/auth/create_customer.sql",
            {
                "customer_id": customer_id,
                "first_name": customer_payload.first_name.strip(),
                "last_name": customer_payload.last_name.strip(),
                "address": customer_payload.address.strip(),
                "email": customer_payload.email.strip(),
                "password_hash": hash_password(customer_payload.password),
                "registration_date": date.today(),
            },
        )

    if payload.checkout_date <= date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Checkout date must be after today")

    try:
        res = query_db_from_sql_file(
            "queries/modify/create_renting.sql",
            {
                "hid": payload.hid,
                "room_number": payload.room_number,
                "customer_id": customer_id,
                "employee_id": employee.actor_id,
                "creation_date": date.today(),
                "checkin_date": date.today(),
                "checkout_date": payload.checkout_date,
                "payment_type": payload.payment_type,
                "payment_amount": payload.payment_amount,
                "booking_id": None,
                "booking_creation_date": None,
            },
            user=WS_EMPLOYEE_USER,
            password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
        )
    except ForeignKeyViolation as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel or room not found")
    except UniqueViolation as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Conflicting booking or renting for dates")
    except IntegrityError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid renting details")

    return res[0]["ref_id"]


@router.post("/rentings/new", status_code=status.HTTP_201_CREATED)
def create_renting(renting: RentingUserDefined, employee: AuthenticatedUser = Depends(require_employee)) -> int:
    ensure_employee_hotel_access(renting.hid, employee)

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
def delete_renting(renting_id: int, employee: AuthenticatedUser = Depends(require_employee)) -> Renting:
    res = query_db_from_sql_file(
        "queries/renting_details.sql",
        {"ref_id": renting_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )

    if len(res) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Renting not found")
    
    renting = Renting(ref_id=renting_id, **res[0])

    ensure_employee_hotel_access(renting.hid, employee)

    query_db_from_sql_file(
        "queries/modify/delete_renting.sql",
        {"ref_id": renting_id},
        user=WS_EMPLOYEE_USER,
        password=WEBSERVER_EMPLOYEE_USER_PASSWORD,
    )

    return renting
