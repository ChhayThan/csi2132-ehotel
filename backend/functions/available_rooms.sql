CREATE OR REPLACE FUNCTION available_rooms(target_checkin DATE, target_checkout DATE) RETURNS TABLE(hid INTEGER, room_number POSITIVE_INTEGER) AS 
$$
BEGIN
    RETURN QUERY
    SELECT room.hid, room.room_number from room
    WHERE room.room_number NOT IN (
        SELECT booking.room_number FROM booking 
        WHERE (
            target_checkin <= checkin_date AND checkin_date <= target_checkout 
            OR target_checkin <= checkout_date AND checkout_date <= target_checkout
            OR checkin_date <= target_checkin AND target_checkout <= checkout_date
        )
        UNION
        SELECT renting.room_number FROM renting 
        WHERE (
            target_checkin <= checkin_date AND checkin_date <= target_checkout 
            OR target_checkin <= checkout_date AND checkout_date <= target_checkout
            OR checkin_date <= target_checkin AND target_checkout <= checkout_date
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION available_rooms FROM PUBLIC;
