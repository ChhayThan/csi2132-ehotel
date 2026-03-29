SELECT hid, name, address_city, address_street_address, address_country, image, chain_name, rating, phone_number, min_price FROM hotel
JOIN (
  SELECT hid, min(price) AS min_price FROM room GROUP BY hid
) USING (hid)
ORDER BY rating DESC
LIMIT %(n)s;
