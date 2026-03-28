INSERT INTO room (
  hid,
  room_number,
  price,
  capacity,
  view,
  extendable,
  problem,
  image
)
VALUES (
  %(hid)s,
  %(room_number)s,
  %(price)s,
  %(capacity)s,
  %(view)s,
  %(extendable)s,
  %(problem)s,
  %(image)s
)
RETURNING room_number;
