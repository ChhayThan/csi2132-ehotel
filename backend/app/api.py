# api to query the database server

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import admin, auth, browse, customer, employee


app = FastAPI()

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

configured_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", ",".join(default_origins)).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(browse.router)
app.include_router(customer.router)
app.include_router(employee.router)
