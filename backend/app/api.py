# api to query the database server

from fastapi import FastAPI
from .routers import admin, auth, browse, customer, employee


app = FastAPI()

app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(browse.router)
app.include_router(customer.router)
app.include_router(employee.router)
