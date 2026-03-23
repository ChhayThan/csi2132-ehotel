SELECT name, address_city, address_street_address, address_country, image, chain_name, rating, phone_number, email_address FROM hotel
LEFT JOIN (
  SELECT hid, array_agg(email_address) AS email_address FROM hotel_email GROUP BY hid
) USING (hid)
WHERE hid = %(hid)s;
