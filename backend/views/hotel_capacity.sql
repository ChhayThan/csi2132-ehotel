CREATE VIEW IF NOT EXISTS hotel_capacity AS
SELECT hid, sum(capacity) AS capacity FROM room GROUP BY hid;
