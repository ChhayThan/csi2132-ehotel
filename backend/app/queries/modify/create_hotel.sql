INSERT INTO hotel (
  name,
  rating,
  address_country,
  address_city,
  address_street_address,
  phone_number,
  image,
  chain_name,
  manager_eid
)
VALUES (
  %(name)s,
  %(rating)s,
  %(country)s,
  %(city)s,
  %(street_address)s,
  %(phone_number)s,
  %(image)s,
  %(chain_name)s,
  %(manager_eid)s
)
RETURNING hid;
