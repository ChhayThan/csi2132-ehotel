from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class CustomerRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    drivers_license: str = Field(min_length=1, max_length=64)
    address: str = Field(min_length=1)


class EmployeeCreationRequest(BaseModel):
    password: str = Field(min_length=8, max_length=72)
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    role: Literal["regular", "admin"]
    address: str = Field(min_length=1)


class CustomerLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class EmployeeLoginRequest(BaseModel):
    employee_id: int
    password: str = Field(min_length=8, max_length=72)


class AuthenticatedUser(BaseModel):
    actor_id: str
    actor_type: str
    role: str
    subject: str


class CurrentCustomerResponse(BaseModel):
    id: str
    actor_type: str
    role: str
    email: EmailStr
    first_name: str
    last_name: str


class CurrentEmployeeResponse(BaseModel):
    id: int
    actor_type: str
    role: str
    first_name: str
    last_name: str
    address: str
    hid: int


class TokenUser(BaseModel):
    id: str
    actor_type: str
    role: str
    email: Optional[EmailStr] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: TokenUser
