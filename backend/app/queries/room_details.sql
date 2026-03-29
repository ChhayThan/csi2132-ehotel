SELECT hid, room_number, price, capacity, view, extendable, problem, image, amenities FROM room
LEFT JOIN (
  SELECT hid, room_number, array_agg(amenity) AS amenities FROM room_amenity GROUP BY hid, room_number
) USING (hid, room_number)
WHERE hid = %(hid)s AND room_number = %(room_number)s;
