from datetime import date
from typing import Optional, Union

from fastapi import APIRouter, Depends, HTTPException, status

from ..auth import create_access_token, get_current_user, hash_password, verify_password
from ..session import query_db_from_sql_file
from ..models.auth_models import AuthenticatedUser, CurrentCustomerResponse, CurrentEmployeeResponse, CustomerLoginRequest, CustomerRegisterRequest, EmployeeLoginRequest, TokenResponse, TokenUser


router = APIRouter(tags=["public", "auth"])


def build_token_response(actor_id: str, actor_type: str, role: str, email: Optional[str] = None) -> TokenResponse:
    # Customer and employee login return the same bearer-token payload shape.
    token = create_access_token(actor_id=actor_id, actor_type=actor_type, role=role)
    return TokenResponse(
        access_token=token,
        user=TokenUser(
            id=actor_id,
            actor_type=actor_type,
            role=role,
            email=email,
        ),
    )


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: CustomerLoginRequest) -> TokenResponse:
    # Customers authenticate by email
    customer = query_db_from_sql_file(
        "queries/auth/get_customer_by_email.sql",
        {"email": payload.email.strip()},
    )
    if len(customer) == 0 or not verify_password(payload.password, customer[0]["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return build_token_response(
        actor_id=customer[0]["id"],
        actor_type="customer",
        role="customer",
        email=customer[0]["email_address"],
    )


@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: CustomerRegisterRequest) -> TokenResponse:
    customer_id = payload.drivers_license.strip()
    email = payload.email.strip()

    # We reject duplicate email and duplicate driver's license before inserting.
    if len(query_db_from_sql_file("queries/auth/get_customer_by_email.sql", {"email": email})) > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if len(query_db_from_sql_file("queries/auth/get_customer_by_id.sql", {"customer_id": customer_id})) > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Drivers license already registered")

    customer = query_db_from_sql_file(
        "queries/auth/create_customer.sql",
        {
            "customer_id": customer_id,
            "first_name": payload.first_name.strip(),
            "last_name": payload.last_name.strip(),
            "address": payload.address.strip(),
            "email": email,
            "password_hash": hash_password(payload.password),
            "registration_date": date.today(),
        },
    )

    return build_token_response(
        actor_id=customer[0]["id"],
        actor_type="customer",
        role="customer",
        email=customer[0]["email_address"],
    )


@router.get("/auth/me", response_model=Union[CurrentCustomerResponse, CurrentEmployeeResponse])
def get_current_actor(current_user: AuthenticatedUser = Depends(get_current_user)) -> Union[CurrentCustomerResponse, CurrentEmployeeResponse]:
    # Hydrate the authenticated principal into the correct frontend-facing actor shape.
    if current_user.actor_type == "customer":
        customer = query_db_from_sql_file(
            "queries/auth/get_customer_by_id.sql",
            {"customer_id": current_user.actor_id},
        )
        if len(customer) == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        row = customer[0]
        return CurrentCustomerResponse(
            id=row["id"],
            actor_type="customer",
            role="customer",
            email=row["email_address"],
            first_name=row["first_name"],
            last_name=row["last_name"],
        )

    if current_user.actor_type == "employee":
        employee = query_db_from_sql_file(
            "queries/auth/get_employee_by_id.sql",
            {"employee_id": int(current_user.actor_id)},
        )
        if len(employee) == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        row = employee[0]
        return CurrentEmployeeResponse(
            id=row["id"],
            actor_type="employee",
            role=row["role"],
            first_name=row["first_name"],
            last_name=row["last_name"],
            address=row["address"],
            hid=row["hid"],
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/employee/login", response_model=TokenResponse)
def employee_login(payload: EmployeeLoginRequest) -> TokenResponse:
    employee = query_db_from_sql_file(
        "queries/auth/get_employee_for_login.sql",
        {"employee_id": payload.employee_id},
    )
    if len(employee) == 0 or not verify_password(payload.password, employee[0]["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid employee ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return build_token_response(
        actor_id=str(employee[0]["id"]),
        actor_type="employee",
        role=employee[0]["role"],
    )
