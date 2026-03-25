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

Database:

- `DATABASE_URL`
- `DB_NAME` default: `ehoteldb`
- `DB_HOST` default: `localhost`
- `DB_PORT` default: `5432`
- `DB_USER` default: `public`
- `DB_PASSWORD` default: empty string

Connection precedence:

- if `DATABASE_URL` is set, the backend uses it
- otherwise it falls back to the individual `DB_*` variables
- if those are not set, it uses the defaults above

Example local setup:

```bash
export AUTH_SECRET_KEY="change-me"
export AUTH_ALGORITHM="HS256"
export AUTH_ACCESS_TOKEN_EXPIRE_MINUTES="60"
export DATABASE_URL="postgresql://public:@localhost:5432/ehoteldb"
```

```
cd backend
fastapi dev --entrypoint api:app
```

View docs at `http://127.0.0.1:8000/docs`
