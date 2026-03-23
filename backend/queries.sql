/** DOCUMENTATION of queries*/

/* available rooms for hotel */
WITH available_rooms_for_hotel AS (
  SELECT hid, room_number, capacity, view, price, problem, extendable FROM 
  room WHERE hid = $1 AND room_number IN (
    SELECT DISTINCT room_number FROM available_rooms($2, $3) WHERE hid = $1
  )
)
SELECT * FROM available_rooms_for_hotel JOIN (
  SELECT hid, room_number, array_agg(amenity) AS amenities FROM room_amenity GROUP BY hid, room_number
) USING (hid, room_number);

/* available hotels in location */
SELECT hid, name, address_city, address_street_address, address_country, image, chain_name, rating, min_price, num_available_rooms FROM hotel
WHERE address_city = $1 AND address_country = $2 
JOIN (
  SELECT hid, count(*) AS num_available_rooms FROM available_rooms($3, $4) GROUP BY hid
) USING (hid)
JOIN (
  SELECT hid, min(price) AS min_price FROM room GROUP BY hid
) USING (hid);

/* top hotels */
SELECT hid, name, address_city, address_street_address, address_country, image, chain_name, rating, min_price FROM hotel
JOIN (
  SELECT hid, min(price) AS min_price FROM room GROUP BY hid
) USING (hid)
ORDER BY rating DESC
LIMIT $1;

/* room details */
SELECT room_number, price, capacity, view, extendable, problem, image, amenities FROM room
JOIN (
  SELECT hid, room_number, array_agg(amenity) AS amenities FROM room_amenity GROUP BY hid, room_number
) USING (hid, room_number)
WHERE hid = $1 AND room_number = $2;

/* hotel details */
SELECT name, address_city, address_street_address, address_country, image, chain_name, rating, phone_number, email_address FROM hotel
WHERE hid = $1
JOIN hotel_email USING (hid);

/* bookings for customer */
SELECT hid, room_number, creation_date, checkin_date, checkout_date FROM booking
WHERE customer_id = $1;

/* archived bookings for customer */
SELECT hid, room_number, creation_date, checkin_date, checkout_date FROM booking_archive
WHERE customer_id = $1;

/* booking details */
SELECT hid, room_number, creation_date, checkin_date, checkout_date FROM booking
WHERE customer_id = $1 AND hid = $2 AND room_number = $3;

/* all current bookings */
SELECT * FROM booking where hid = $1;

/* all archived bookings */
SELECT * FROM booking_archive where hid = $1;

/* all current rentings */
SELECT * FROM renting where hid = $1;

/* all archived rentings */
SELECT * FROM renting_archive where hid = $1;

/* all hotel chains */
SELECT * FROM hotel_chain JOIN (
  SELECT name, array_agg(email_address) AS email_addresses FROM hotel_chain_email GROUP BY name
) USING (name)
JOIN (
  SELECT chain_name, count(*) AS num_hotels FROM hotel GROUP BY chain_name
) ON (name = chain_name);

/* all hotels in chain */
SELECT * FROM hotel JOIN (
  SELECT hid, array_agg(email_address) AS email_addresses FROM hotel_email GROUP BY hid
) USING (hid)
WHERE chain_name = $1;

/* all employees in hotel */
SELECT id, first_name, last_name, role, address FROM employee WHERE hid = $1;

/* all rooms in hotel */
SELECT * FROM room WHERE hid = $1;
