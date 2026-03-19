CREATE VIEW hotel_capacity AS
SELECT hid, sum(capacity) AS capacity FROM room GROUP BY hid;
