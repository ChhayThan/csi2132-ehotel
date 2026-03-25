# Backend Authentication Guide

This document explains how authentication currently works in the `ehotel` backend and how the frontend should use the returned tokens to manage a signed-in session.

This is a practical guide for development and integration, not a planning document.

## 1. Overview

The backend uses JWT bearer authentication.

That means:

- a user logs in or registers
- the backend returns an `access_token`
- the frontend stores that token
- the frontend sends the token in the `Authorization` header on future requests
- the backend verifies the token and determines who the caller is

The backend currently supports two authenticated actor types:

- `customer`
- `employee`

Employees can have one of these roles:

- `regular`
- `admin`

## 2. Main Backend Auth Files

Authentication is mainly implemented in these files:

- [auth.py](/ehotels/backend/auth.py)
  - password hashing and verification
  - JWT creation and decoding
  - auth dependencies used by routes
- [auth_models.py](/ehotels/backend/auth_models.py)
  - login/register request models
  - token response models
  - current-user response models
- [api.py](/ehotels/backend/api.py)
  - customer login/register routes
  - employee login route
  - `/auth/me`
  - protected customer, employee, and admin routes
- [queries/auth](/ehotels/backend/queries/auth)
  - SQL queries for customer and employee lookup/creation

## 3. Auth Endpoints

Current auth-related endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /employee/login`
- `GET /auth/me`

### 3.1 Customer Register

Route:

- `POST /auth/register`

Request body:

```json
{
  "email": "newuser@email.com",
  "password": "password123",
  "first_name": "New",
  "last_name": "User",
  "drivers_license": "DL9999999",
  "address": "1 Test St, Toronto, CAN"
}
```

What happens:

- request is validated by `CustomerRegisterRequest`
- email uniqueness is checked
- driver's license uniqueness is checked
- password is hashed with bcrypt
- a new customer row is inserted
- a JWT access token is returned immediately

### 3.2 Customer Login

Route:

- `POST /auth/login`

Request body:

```json
{
  "email": "john.doe@email.com",
  "password": "password123"
}
```

What happens:

- backend finds the customer by email
- bcrypt verifies the submitted password against `password_hash`
- if valid, backend returns a JWT token

### 3.3 Employee Login

Route:

- `POST /employee/login`

Request body:

```json
{
  "employee_id": 1,
  "password": "password123"
}
```

What happens:

- backend finds the employee by employee ID
- bcrypt verifies the submitted password
- if valid, backend returns a JWT token
- the token role is based on the employee row, usually `regular` or `admin`

### 3.4 Current Actor

Route:

- `GET /auth/me`

Purpose:

- let the frontend restore the current signed-in user from a stored token

Behavior:

- if the token belongs to a customer, returns the customer profile shape
- if the token belongs to an employee, returns the employee profile shape

Customer example response:

```json
{
  "id": "DL1000001",
  "actor_type": "customer",
  "role": "customer",
  "email": "john.doe@email.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

Employee example response:

```json
{
  "id": 1,
  "actor_type": "employee",
  "role": "admin",
  "first_name": "Alice",
  "last_name": "Smith",
  "address": "123 Maple St, Grand Rapids, USA",
  "hid": 1
}
```

## 4. Token Response Shape

Both customer and employee login return the same top-level token response format.

Example customer token response:

```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer",
  "user": {
    "id": "DL1000001",
    "actor_type": "customer",
    "role": "customer",
    "email": "john.doe@email.com"
  }
}
```

Example employee token response:

```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer",
  "user": {
    "id": "1",
    "actor_type": "employee",
    "role": "admin",
    "email": null
  }
}
```

Notes:

- `token_type` is always `bearer`
- employee `user.email` is `null` because employees do not currently log in with email
- employee `id` is serialized as a string in the token response because token claims are treated consistently as strings

## 5. JWT Contents

The backend creates tokens in [auth.py](/ehotels/backend/auth.py).

Current JWT payload fields:

- `sub`
- `actor_id`
- `actor_type`
- `role`
- `exp`

Example customer payload:

```json
{
  "sub": "customer:DL1000001",
  "actor_id": "DL1000001",
  "actor_type": "customer",
  "role": "customer",
  "exp": 1760000000
}
```

Example employee payload:

```json
{
  "sub": "employee:1",
  "actor_id": "1",
  "actor_type": "employee",
  "role": "admin",
  "exp": 1760000000
}
```

Meaning of each field:

- `sub`
  - the subject of the token
  - combines actor type and actor ID
- `actor_id`
  - the authenticated user identifier
  - customer: driver’s license string
  - employee: employee ID as string
- `actor_type`
  - either `customer` or `employee`
- `role`
  - used for authorization checks
  - `customer`, `regular`, or `admin`
- `exp`
  - token expiration timestamp

## 6. Password Handling

Passwords are handled in [auth.py](/ehotels/backend/auth.py).

Current behavior:

- passwords are hashed with `bcrypt`
- submitted passwords are verified with `bcrypt.checkpw`
- max password length is 72 bytes because bcrypt has that limit

Validation rules currently enforced by request models:

- minimum length: 8
- maximum length: 72

Important frontend note:

- do not trim passwords automatically on the frontend
- do trim accidental whitespace around emails if desired

## 7. How Route Protection Works

FastAPI route protection is based on dependencies from [auth.py](/ehotels/backend/auth.py).

Main dependency flow:

1. `OAuth2PasswordBearer` extracts the bearer token from the request header
2. `get_current_user()` decodes the token
3. route-specific guards check actor type and role

Main guard functions:

- `get_current_user`
- `require_customer`
- `require_employee`
- `require_admin`

What they do:

- `get_current_user`
  - verifies JWT signature
  - verifies token expiration
  - validates required claims
  - returns `AuthenticatedUser`
- `require_customer`
  - allows only customer tokens
- `require_employee`
  - allows only employee tokens
- `require_admin`
  - allows only employee tokens with role `admin`

Example:

- customer booking routes use `Depends(require_customer)`
- employee hotel routes use `Depends(require_employee)`
- admin routes use `Depends(require_admin)`

## 8. How The Frontend Should Send Tokens

The frontend should send the JWT in the `Authorization` header.

Format:

```http
Authorization: Bearer <access_token>
```

Example fetch request:

```ts
const response = await fetch("http://127.0.0.1:8000/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

Example POST request:

```ts
const response = await fetch("http://127.0.0.1:8000/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "john.doe@email.com",
    password: "password123",
  }),
});
```

For authenticated POST/GET requests:

```ts
const response = await fetch(`http://127.0.0.1:8000/${customerId}/bookings?archived=false`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## 9. Recommended Frontend Session Flow

The backend does not currently manage server-side sessions.

The frontend is responsible for session state by storing and reusing the JWT access token.

Recommended flow:

### 9.1 Login Flow

1. user submits login form
2. frontend sends credentials to either:
   - `POST /auth/login` for customers
   - `POST /employee/login` for employees
3. backend returns `access_token`
4. frontend stores the token
5. frontend stores the returned lightweight `user` object or immediately calls `/auth/me`
6. frontend marks the user as authenticated

### 9.2 Registration Flow

1. user submits customer registration form
2. frontend calls `POST /auth/register`
3. backend creates the user and returns `access_token`
4. frontend stores the token
5. frontend initializes authenticated UI state

### 9.3 App Reload / Session Restore Flow

On app startup:

1. frontend checks whether a token is stored
2. if no token exists, user is treated as signed out
3. if token exists, frontend calls `GET /auth/me`
4. if `/auth/me` succeeds, user stays signed in
5. if `/auth/me` returns `401`, token should be cleared and user should be treated as signed out

This is the most important frontend session pattern for the current backend.

## 10. Where To Store The Token

The backend is currently designed for bearer-token usage and does not issue cookies.

That means the frontend needs to decide where to store the token.

Common options:

- memory-only state
- `localStorage`
- `sessionStorage`

Practical guidance for this project:

- `localStorage`
  - easiest for development
  - survives page reloads
  - works well with `/auth/me` session restoration
- in-memory only
  - more restrictive
  - user is logged out on refresh

If using `localStorage`, the basic pattern is:

```ts
localStorage.setItem("access_token", token);
```

And to restore:

```ts
const token = localStorage.getItem("access_token");
```

Important note:

- storing JWTs in `localStorage` is convenient, but it is less secure than an httpOnly cookie approach in a production-grade system
- for the current backend design, it is the simplest workable pattern

## 11. Frontend Role Handling

The frontend should use either:

- the `user` object returned from login
- or the `/auth/me` response

to decide which UI to show.

Useful checks:

- if `actor_type === "customer"`
  - show customer-facing booking/account UI
- if `actor_type === "employee"` and `role === "regular"`
  - show employee hotel operations UI
- if `actor_type === "employee"` and `role === "admin"`
  - show admin management UI

Do not rely only on the frontend for security.

The backend still enforces authorization using:

- `require_customer`
- `require_employee`
- `require_admin`

Frontend role checks are for UX, not actual security.

## 12. Error Handling On The Frontend

Recommended frontend behavior:

### 12.1 `401 Unauthorized`

Usually means:

- token is invalid
- token is expired
- credentials are wrong

Frontend response:

- clear stored token if appropriate
- redirect to login or signed-out state
- show user-friendly auth error message

### 12.2 `403 Forbidden`

Usually means:

- user is authenticated but lacks the required actor type or role

Examples:

- customer token hitting employee route
- regular employee token hitting admin route
- customer trying to read another customer’s bookings

Frontend response:

- keep session
- show access denied UI or redirect away from forbidden page

## 13. Example Frontend Integration

Example login helper:

```ts
type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user: {
    id: string;
    actor_type: "customer" | "employee";
    role: string;
    email: string | null;
  };
};

export async function loginCustomer(email: string, password: string) {
  const response = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data: LoginResponse = await response.json();
  localStorage.setItem("access_token", data.access_token);
  return data;
}
```

Example authenticated request helper:

```ts
export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(init.headers ?? {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(path, {
    ...init,
    headers,
  });
}
```

Example session restore:

```ts
export async function loadSession() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return null;
  }

  const response = await fetch("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to restore session");
  }

  return response.json();
}
```

## 14. Current Limitations

The current auth system is intentionally simple.

Not currently implemented:

- refresh tokens
- logout invalidation on the backend
- password reset
- email verification
- cookie-based auth
- server-side session storage

That means:

- logout is currently a frontend action that clears the stored token
- expired tokens require re-login

## 15. Recommended Development Workflow

When working on frontend auth integration:

1. log in or register
2. store `access_token`
3. call `/auth/me`
4. render the correct UI for customer or employee
5. attach bearer token to every protected request
6. clear token on `401`

## 16. Summary

The backend uses JWT bearer tokens with bcrypt password hashing.

Customers authenticate through:

- `POST /auth/register`
- `POST /auth/login`

Employees authenticate through:

- `POST /employee/login`

The frontend should:

- store the returned `access_token`
- send it as `Authorization: Bearer <token>`
- call `GET /auth/me` to restore session state
- use `actor_type` and `role` to decide which UI to show

The backend remains the final source of truth for authorization, while the frontend uses token/session state mainly for navigation and UX.
