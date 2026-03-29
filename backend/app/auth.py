import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from .models.auth_models import AuthenticatedUser


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "dev-auth-secret")
AUTH_ALGORITHM = os.getenv("AUTH_ALGORITHM", "HS256")
AUTH_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("AUTH_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        raise ValueError("Password cannot be longer than 72 bytes for bcrypt")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        return False

    hash_bytes = password_hash.encode("utf-8")
    try:
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except ValueError:
        return False


def create_access_token(actor_id: str, actor_type: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    expire_at = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=AUTH_ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "sub": f"{actor_type}:{actor_id}",
        "actor_id": actor_id,
        "actor_type": actor_type,
        "role": role,
        "exp": expire_at,
    }
    return jwt.encode(payload, AUTH_SECRET_KEY, algorithm=AUTH_ALGORITHM)


def decode_access_token(token: str) -> AuthenticatedUser:
    try:
        payload = jwt.decode(token, AUTH_SECRET_KEY, algorithms=[AUTH_ALGORITHM])
    except JWTError as exc:
        raise credentials_exception from exc

    subject = payload.get("sub")
    actor_id = payload.get("actor_id")
    actor_type = payload.get("actor_type")
    role = payload.get("role")
    if not all([subject, actor_id, actor_type, role]):
        raise credentials_exception

    return AuthenticatedUser(
        actor_id=str(actor_id),
        actor_type=str(actor_type),
        role=str(role),
        subject=str(subject),
    )


def get_current_user(token: str = Depends(oauth2_scheme)) -> AuthenticatedUser:
    return decode_access_token(token)


def require_customer(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    if current_user.actor_type != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer access required")
    return current_user


def require_employee(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    if current_user.actor_type != "employee":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Employee access required")
    return current_user


def require_admin(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    if current_user.actor_type != "employee" or current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
