CREATE VIEW hotel_detailed AS
SELECT * FROM hotel LEFT JOIN (
  SELECT hid, array_agg(email_address) AS email_addresses FROM hotel_email GROUP BY hid
) USING (hid);
