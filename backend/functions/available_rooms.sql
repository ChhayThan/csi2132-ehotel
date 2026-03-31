CREATE OR REPLACE FUNCTION available_rooms(target_checkin DATE, target_checkout DATE) RETURNS TABLE(hid INTEGER, room_number POSITIVE_INTEGER) AS 
$$
BEGIN
    IF target_checkout >= target_checkin THEN
        RAISE EXCEPTION 'checkin date must be strictly less than checkout date';
    END IF;

    RETURN QUERY
    SELECT room.hid, room.room_number from room
    WHERE room.room_number NOT IN (
        SELECT booking.room_number FROM booking 
        WHERE target_checkin <= checkout_date AND target_checkout <= checkin_date 
        UNION
        SELECT renting.room_number FROM renting 
        WHERE target_checkin <= checkout_date AND target_checkout <= checkin_date
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION available_rooms FROM PUBLIC;
