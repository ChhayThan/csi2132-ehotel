CREATE VIEW IF NOT EXISTS rooms_by_city AS
SELECT address_city AS city, count(*) AS num_rooms FROM hotel
JOIN available_rooms(CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day') USING (hid)
GROUP BY address_city;
