CREATE VIEW rooms_by_city AS
SELECT address_city AS city, count(*) AS num_rooms FROM hotel
JOIN available_rooms(date(CURRENT_DATE), date(CURRENT_DATE + INTERVAL '1 day')) USING (hid)
GROUP BY address_city;
