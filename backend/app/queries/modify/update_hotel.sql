UPDATE hotel 
SET 
  name = %(name)s,
  rating = %(rating)s,
  address_country = %(country)s,
  address_city = %(city)s,
  address_street_address = %(street_address)s,
  phone_number = %(phone_number)s,
  image = %(image)s,
  manager_eid = %(manager_eid)s
WHERE hid = %(hid)s
RETURNING hid;
  