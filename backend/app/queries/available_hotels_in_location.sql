SELECT hid, name, address_city, address_street_address, address_country, image, chain_name, rating, phone_number, min_price, num_available_rooms FROM hotel 
JOIN (
  SELECT hid, count(*) AS num_available_rooms FROM available_rooms(%(checkin_date)s, %(checkout_date)s) GROUP BY hid
) USING (hid)
JOIN (
  SELECT hid, min(price) AS min_price FROM room GROUP BY hid
) USING (hid)
WHERE address_city = %(city)s AND address_country = %(country)s;
