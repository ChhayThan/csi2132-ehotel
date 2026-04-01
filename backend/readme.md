# Running the Backend

## Environment Variables

Authentication:

- `AUTH_SECRET_KEY`
- `AUTH_ALGORITHM` default: `HS256`
- `AUTH_ACCESS_TOKEN_EXPIRE_MINUTES` default: `60`

Password hashing:

- the backend uses `bcrypt` directly
- bcrypt passwords are limited to 72 bytes, so auth request validation enforces a max password length of 72 characters
- mock seed hashes are stored in standard `$2b$...` bcrypt format

Auth endpoints:

- `POST /auth/register` for customer registration
- `POST /auth/login` for customer login
- `POST /employee/login` for employee login
- `GET /auth/me` returns the current customer or employee profile based on the bearer token

Database:

- `DB_NAME` default: `ehoteldb`
- `DB_HOST` default: `localhost`
- `DB_PORT` default: `5432`
- `DB_USER` default: `public`
- `DB_PASSWORD` default: empty string
- `DB_WS_USER_PASSWORD` default: `DB_PASSWORD`
- `DB_WS_CUSTOMER_PASSWORD` default: `DB_WS_USER_PASSWORD`
- `DB_WS_EMPLOYEE_PASSWORD` default: `DB_WS_USER_PASSWORD`
- `DB_WS_ADMIN_PASSWORD`  default: `DB_WS_EMPLOYEE_PASSWORD`
- `DB_WS_AUTH_PASSWORD` default: `DB_WS_USER_PASSWORD`

If the `DB_*` variables are not set, it uses the defaults above. 
Depending on the request, the webserver uses one of the webserver roles in the database. 
The password inheritance is inherited as described if any passwords are unspecified.

Example local setup:

```bash
export AUTH_SECRET_KEY="change-me"
export AUTH_ALGORITHM="HS256"
export AUTH_ACCESS_TOKEN_EXPIRE_MINUTES="60"
```

```
cd backend
fastapi dev --entrypoint api:app
```

View docs at `http://127.0.0.1:8000/docs`

## Setting up the Database

As a user with sufficient permissions:  

Install postgres and create the database
```bash
createdb $DB_NAME
```

Run the setup python scripts (assuming cwd is the project root)
```bash
cd backend

python ddl/generate_roles_from_env.py
python mock_data/populate_tables.py
```

Run the ddl files in order  
1. create_types.sql
1. create_tables.sql
1. all files under backend/functions/
1. all files under backend/views/
1. init_roles.sql
1. all files under backend/triggers/

Run the `load_mock_data.sql` file generated earlier.
