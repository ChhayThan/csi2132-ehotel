Use these while the backend is running on `http://127.0.0.1:8000`.

Customer login:
```bash
curl -s -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@email.com","password":"password123"}'
```

Admin employee login:
```bash
curl -s -X POST http://127.0.0.1:8000/employee/login \
  -H "Content-Type: application/json" \
  -d '{"employee_id":1,"password":"password123"}'
```

Regular employee login:
```bash
curl -s -X POST http://127.0.0.1:8000/employee/login \
  -H "Content-Type: application/json" \
  -d '{"employee_id":9,"password":"password123"}'
```

Test `/auth/me` with a token:
```bash
curl -s http://127.0.0.1:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Test admin route with admin token:
```bash
curl -i http://127.0.0.1:8000/admin/hotel_chains \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

Test admin route with regular employee token:
```bash
curl -i http://127.0.0.1:8000/admin/hotel_chains \
  -H "Authorization: Bearer REGULAR_EMPLOYEE_TOKEN_HERE"
```

Test employee route with employee token:
```bash
curl -i "http://127.0.0.1:8000/employee/hotels/1/bookings?archived=false" \
  -H "Authorization: Bearer EMPLOYEE_TOKEN_HERE"
```

Test customer bookings with customer token:
```bash
curl -i "http://127.0.0.1:8000/DL1000001/bookings?archived=false" \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE"
```

Test customer trying to access another customer’s bookings:
```bash
curl -i "http://127.0.0.1:8000/DL1000002/bookings?archived=false" \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE"
```

If you want to make this easier, you can save tokens into shell vars:

```bash
CUSTOMER_TOKEN="..."
ADMIN_TOKEN="..."
REGULAR_TOKEN="..."
```

Then use:

```bash
curl -s http://127.0.0.1:8000/auth/me -H "Authorization: Bearer $CUSTOMER_TOKEN"
curl -i http://127.0.0.1:8000/admin/hotel_chains -H "Authorization: Bearer $ADMIN_TOKEN"
curl -i http://127.0.0.1:8000/admin/hotel_chains -H "Authorization: Bearer $REGULAR_TOKEN"
```