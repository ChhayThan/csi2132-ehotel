With backend running on http://localhost:8000 and CUSTOMER_TOKEN, EMPLOYEE_TOKEN, ADMIN_TOKEN as env with bearer prefix and generated from previous request to auth backend.  
(i.e. `export CUSTOMER_TOKEN='Bearer ...'`)

Note:  
As an actor, directly accessing a resource that does not belong to you (through its id) 
returns 404_NOT_FOUND instead of 403_FORBIDDEN to not expose whether the resource exists.

## Public

### READ

Available hotels in city:
```bash
curl -X GET \
  'http://127.0.0.1:8000/hotels/available?city=Nashville&country=US&checkin_date=2026-04-01&checkout_date=2026-04-03' \
  -H 'accept: application/json'
```

Top n hotels:
```bash
curl -X GET \
  'http://127.0.0.1:8000/hotels/top?limit=5' \
  -H 'accept: application/json'
```

Hotel with id:
```bash
curl -X GET \
  'http://127.0.0.1:8000/hotels/1' \
  -H 'accept: application/json'
```

Select available rooms in hotel (room 101 not returned since a booking exists between target dates):
```bash
curl -X GET \
  'http://127.0.0.1:8000/hotels/1/rooms/available?checkin_date=2026-04-02&checkout_date=2026-04-04' \
  -H 'accept: application/json'
```

Room with number in hotel with id:
```bash
curl -X GET \
  'http://127.0.0.1:8000/hotels/1/rooms/102' \
  -H 'accept: application/json'
```

## Customer

### READ

Bookings for customer:
```bash
curl -X GET \
  'http://127.0.0.1:8000/DL1000001/bookings?archived=false' \
  -H 'accept: application/json' \
  -H "Authorization: $CUSTOMER_TOKEN"
```

Booking details:
```bash
curl -X GET \
  'http://127.0.0.1:8000/DL100001/bookings/1' \
  -H 'accept: application/json' \
  -H "Authorization: $CUSTOMER_TOKEN"
```

### CREATE

Valid booking:
```bash
curl -X POST \
  'http://127.0.0.1:8000/DL1000001/bookings/new' \
  -H "Content-Type: application/json" \
  -H "Authorization: $CUSTOMER_TOKEN" \
  -d '{"hid": 1, "room_number": 105, "checkin_date": "2026-04-06", "checkout_date": "2026-04-07"}'
```

Overlapping booking (should reject once trigger implemented):
```bash
curl -X POST \
  'http://127.0.0.1:8000/DL1000001/bookings/new' \
  -H "Content-Type: application/json" \
  -H "Authorization: $CUSTOMER_TOKEN" \ 
  -d '{"hid": 5, "room_number": 503, "checkin_date": "2026-05-21", "checkout_date": "2026-05-26"}'
```

Non-existent hotel or room (returns 404):
```bash
curl -X POST \
  'http://127.0.0.1:8000/DL1000001/bookings/new' \
  -H "Content-Type: application/json" \
  -H "Authorization: $CUSTOMER_TOKEN" \ 
  -d '{"hid": 1, "room_number": 205, "checkin_date": "2026-04-06", "checkout_date": "2026-04-07"}'
```

### DELETE

Returns deleted booking details:
```bash
curl -X DELETE \
  'http://127.0.0.1:8000/DL1000001/bookings/8/cancel' \
  -H "Authorization: $CUSTOMER_TOKEN"
```

Delete other customer's booking (treat as booking does not exist, returns 404):
```bash
curl -X DELETE \
  'http://127.0.0.1:8000/DL1000001/bookings/2/cancel' \
  -H "Authorization: $CUSTOMER_TOKEN"
```

Delete non-existent booking (returns 404):
```bash
curl -X DELETE \
  'http://127.0.0.1:8000/DL1000001/bookings/200/cancel' \
  -H "Authorization: $CUSTOMER_TOKEN"
```

## Employee

### READ

Get all bookings for hotel:
```bash
curl -X GET \
  'http://127.0.0.1:8000/employee/hotels/1/bookings?archived=false' \
  -H 'accept: application/json' \
  -H "Authorization: $EMPLOYEE_TOKEN"
```

Get bookings for non-existent hotel returns empty list.

Get all rentings for hotel:
```bash
curl -X GET \
  'http://127.0.0.1:8000/employee/hotels/1/rentings?archived=false' \
  -H 'accept: application/json' \
  -H "Authorization: $EMPLOYEE_TOKEN"
```

### CREATE

Payment amount not currently validated but should be checked that payment amount = rental period * room price with trigger.

From booking:
```bash
curl -X POST \
  'http://127.0.0.1:8000/employee/rentings/convert' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $EMPLOYEE_TOKEN" \
  -d '{"booking_id": 7, "payment_type": "debit", "payment_amount": 400}'
```

New renting without booking:
```bash
curl -X POST \
  'http://127.0.0.1:8000/employee/rentings/new' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $EMPLOYEE_TOKEN" \
  -d '{
    "hid": 1,
    "room_number": 101,
    "customer_id": "DL1000001",
    "checkin_date": "2026-03-30",
    "checkout_date": "2026-03-31",
    "payment_type": "debit",
    "payment_amount": 0
  }'
```

Invalid customer id (returns 404):
```bash
curl -X POST \
  'http://127.0.0.1:8000/employee/rentings/new' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $EMPLOYEE_TOKEN" \
  -d '{
    "hid": 1,
    "room_number": 101,
    "customer_id": "NON_EXISTENT_PERSON",
    "checkin_date": "2026-03-30",
    "checkout_date": "2026-03-31",
    "payment_type": "debit",
    "payment_amount": 0
  }'
```

### DELETE

Delete renting:
```bash
curl -X DELETE \
  'http://127.0.0.1:8000/employee/rentings/1/delete'\ 
  -H 'accept: application/json' \
  -H "Authorization: $EMPLOYEE_TOKEN"
```

Delete non-existent renting returns 404

## Admin

### READ

All hotel chains:
```bash
curl -X GET \
  'http://127.0.0.1:8000/admin/hotel_chains' \
  -H 'accept: application/json' \
  -H "Authorization: $ADMIN_TOKEN"
```

All hotels in chain:
```bash
curl -X GET \
  'http://127.0.0.1:8000/admin/hotel_chains/Lumina%20Grand/hotels' \
  -H 'accept: application/json' \
  -H "Authorization: $ADMIN_TOKEN"
```

All rooms in hotel:
```bash
curl -X GET \
  'http://127.0.0.1:8000/admin/hotels/7/rooms' \
  -H 'accept: application/json' \
  -H "Authorization: $ADMIN_TOKEN"
```

All employees of hotel:
```bash
curl -X GET \
  'http://127.0.0.1:8000/admin/hotels/7/employees' \
  -H 'accept: application/json' \
  -H "Authorization: $ADMIN_TOKEN"
```

### CREATE

Create hotel chain:
```bash
curl -X POST \
  'http://127.0.0.1:8000/admin/hotel_chains/new' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $ADMIN_TOKEN" \
  -d '{
    "name": "Escape",
    "address": "1234 Dream Street, Ottawa, Canada",
    "phone_number": "1231231234",
    "email_addresses": [
      "info@escape.com",
      "help@escape.com"
    ]
  }'
```

Create hotel:
```bash
curl -X POST \
  'http://127.0.0.1:8000/admin/hotels/new?chain_name=Escape' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $ADMIN_TOKEN" \
  -d '{
    "name": "Dreamscape",
    "rating": 3,
    "address": {
      "city": "Ottawa",
      "street_address": "9876 Memory Lane",
      "country": "CA"
    },
    "image": "dreamscape.jpg",
    "phone_number": "4554551234",
    "email_addresses": [
      "contact@dreamscape.com"
    ],
    "manager_eid": 1
  }'
```

Create room:
```bash
curl -X POST \
  'http://127.0.0.1:8000/admin/hotels/11/rooms/new' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $ADMIN_TOKEN" \
  -d '{
    "room_number": 100,
    "capacity": 1,
    "view": "Mountain",
    "price": 200,
    "problem": "Uh oh",
    "extendable": true,
    "amenities": [
      "WiFi",
      "AC"
    ],
    "image": "h11r100.jpg"
  }'
```

Create employee:
```bash
curl -X POST \
  'http://127.0.0.1:8000/admin/employees/new?hotel_id=11' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $ADMIN_TOKEN" \
  -d '{
    "password": "password123",
    "first_name": "Willy",
    "last_name": "Wonka",
    "role": "regular",
    "address": "123 Chocolate Factor Drive, Ottawa, Canada"
  }'
```


### Update

Update email addresses and name of hotel chain:
```bash
curl -X PUT \
  'http://127.0.0.1:8000/admin/hotel_chains/Escape/manage' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $ADMIN_TOKEN" \
  -d '{
    "name": "Paradise Retreat",
    "email_addresses": [
      "info@escape.com",
      "contact@escape.com"
    ]
  }'
```

Update email addresses and street address of hotel:
```bash
curl -X PUT \
  'http://127.0.0.1:8000/admin/hotels/11/manage' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $ADMIN_TOKEN" \
  -d '{
    "address": {
      "street_address": "9855 Memory Lane"
    },
    "email_addresses": [
      "new.contact@dreamscape.com"
    ]
  }'
```

Update amenity and problem of room:
```bash
curl -X PUT \
  'http://127.0.0.1:8000/admin/hotels/11/rooms/100/manage' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $ADMIN_TOKEN" \
  -d '{
    "problem": "",
    "amenities": [
      "WiFi",
      "AC",
      "Balcony"
    ]
  }'
```

Update name and address of employee:
```bash
curl -X PUT \
  'http://127.0.0.1:8000/admin/employees/10/manage' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "Authorization: $ADMIN_TOKEN" \
  -d '{
    "first_name": "Wanda",
    "address": "555 Chocolate Factor Drive, Ottawa, Canada"
  }'
```

### Delete

Delete hotel chain:
```bash
curl -X DELETE \
  'http://127.0.0.1:8000/admin/hotel_chains/Escape/delete' \
  -H 'accept: application/json' \
  -H "Authorization: $ADMIN_TOKEN"
```

Delete hotel:
```bash
curl -X DELETE \
  'http://127.0.0.1:8000/admin/hotels/11/delete' \
  -H 'accept: application/json' \
  -H "Authorization: $ADMIN_TOKEN"
```

Delete room:
```bash
curl -X DELETE \
  'http://127.0.0.1:8000/admin/hotels/11/rooms/100/delete' \
  -H 'accept: application/json' \
  -H "Authorization: $ADMIN_TOKEN"
```

Delete employee:
```bash
curl -X DELETE \
  'http://127.0.0.1:8000/admin/employees/10/delete' \
  -H 'accept: application/json' \
  -H "Authorization: $ADMIN_TOKEN"
```
