UPDATE room
SET 
  room_number = %(room_number)s,
  price = %(price)s,
  capacity = %(capacity)s,
  view = %(view)s,
  extendable = %(extendable)s,
  problem = %(problem)s,
  image = %(image)s
WHERE hid = %(hid)s AND room_number = %(old_room_number)
RETURNING room_number;
