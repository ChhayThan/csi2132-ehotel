SELECT * FROM room
LEFT JOIN (
  SELECT hid, room_number, array_agg(amenity) AS amenities 
  FROM room_amenity 
  GROUP BY hid, room_number
) a USING (hid, room_number)
WHERE room.hid = %(hid)s;