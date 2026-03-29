CREATE VIEW hotel_chain_detailed AS
SELECT name, address, phone_number, email_addresses, COALESCE(num_hotels, 0) AS num_hotels FROM hotel_chain LEFT JOIN (
  SELECT name, array_agg(email_address) AS email_addresses FROM hotel_chain_email GROUP BY name
) USING (name)
LEFT JOIN (
  SELECT chain_name, count(*) AS num_hotels FROM hotel GROUP BY chain_name
) ON (name = chain_name);
