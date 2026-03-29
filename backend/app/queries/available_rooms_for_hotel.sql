WITH available_rooms_for_hotel AS (
  SELECT hid, room_number, capacity, view, price, problem, extendable FROM 
  room WHERE hid = %(hid)s AND room_number IN (
    SELECT DISTINCT room_number FROM available_rooms(%(checkin_date)s, %(checkout_date)s) WHERE hid = %(hid)s
  )
)
SELECT * FROM available_rooms_for_hotel LEFT JOIN (
  SELECT hid, room_number, array_agg(amenity) AS amenities FROM room_amenity GROUP BY hid, room_number
) USING (hid, room_number);
