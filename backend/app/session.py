import csv
from io import StringIO
from pathlib import Path
from typing import Any

import pandas as pd

from psycopg2 import connect, sql

from .constants import (
	DB_HOST,
	DB_NAME,
	DB_PORT,
	WEBSERVER_USER_PASSWORD,
	WS_USER
)


BASE_DIR = Path(__file__).resolve().parent


def query_db_from_sql_file(
        file_path: str,
        params: Any = (),
        identifiers: tuple | dict = None,
        user: str = WS_USER,
        password: str = WEBSERVER_USER_PASSWORD,
        host: str = DB_HOST,
        port: int = DB_PORT
        ) -> list[dict[str, Any]]:
    # Resolve SQL files relative to the backend package so imports work from any cwd.
    with open(BASE_DIR / file_path, "r") as f:
        query = f.read()

    if type(identifiers) is tuple:
        query = sql.SQL(query).format(*(sql.Identifier(identifier) for identifier in identifiers))
    elif type(identifiers) is dict:
        query = sql.SQL(query).format(**{arg_name: sql.Identifier(identifier) for arg_name, identifier in identifiers.items()})

    return query_db({"_main": (query, params)}, user, password, host, port).get("_main", [])


def execute_multiple_from_sql_files(
        statements: dict[str, tuple[str, Any, tuple | dict | None]],
        user: str = WS_USER,
        password: str = WEBSERVER_USER_PASSWORD,
        host: str = DB_HOST,
        port: int = DB_PORT
        ) -> list[dict[str, Any]]:
    
    queries = {}

    for name, request in statements.items():
        file_path, params, identifiers = request
        with open(BASE_DIR / file_path, "r") as f:
            query = f.read()

        if type(identifiers) is tuple:
            query = sql.SQL(query).format(*(sql.Identifier(identifier) for identifier in identifiers))
        elif type(identifiers) is dict:
            query = sql.SQL(query).format(**{arg_name: sql.Identifier(identifier) for arg_name, identifier in identifiers.items()})

        queries[name] = (query, params)

    return query_db(queries, user, password, host, port)


def query_db(
        statements: dict[str, tuple[str, Any]],
        user: str = WS_USER,
        password: str = WEBSERVER_USER_PASSWORD,
        host: str = DB_HOST,
        port: int = DB_PORT
        ) -> list[dict[str, Any]]:
    # Prefer DATABASE_URL when provided, but keep explicit params/env fallbacks for local use.
    connection_kwargs = {
        "dbname": DB_NAME,
        "user": user,
        "password": password,
        "host": host,
        "port": port,
    }

    res = {}

    with connect(**connection_kwargs) as conn:
        # multiple requests in one with block bound and executed as single transaction
        for name, request in statements.items():
            query, params = request

            if isinstance(query, sql.Composable):
                query = query.as_string(conn)
                
            df = pd.read_sql_query(query, conn, params=params)
            res[name] = df.to_dict(orient="records")

    return res


def parse_pg_array(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value]
    if not isinstance(value, str):
        return [str(value)]
    if not (value.startswith("{") and value.endswith("}")):
        return [value]

    inner = value[1:-1]
    if inner == "":
        return []

    # PostgreSQL array strings use CSV-style escaping for quoted elements.
    return next(csv.reader(StringIO(inner), delimiter=",", quotechar='"', escapechar="\\"))
