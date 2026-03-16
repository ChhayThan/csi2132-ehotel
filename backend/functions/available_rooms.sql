CREATE FUNCTION available_rooms(target_checkin DATE, target_checkout DATE) RETURNS TABLE(hid INTEGER, room_number INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT hid, room_number from room
    WHERE room_number NOT IN (
        SELECT room_number FROM booking WHERE target_checkin <= checkin_date AND checkin_date <= target_checkout OR target_checkin <= checkout_date AND checkout_date <= target_checkout
        UNION
        SELECT room_number FROM renting WHERE target_checkin <= checkin_date AND checkin_date <= target_checkout OR target_checkin <= checkout_date AND checkout_date <= target_checkout
    );
END;
$$ LANGUAGE plpgsql;
