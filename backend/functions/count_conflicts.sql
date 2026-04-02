CREATE OR REPLACE FUNCTION num_conflicts(target_checkin DATE, target_checkout DATE)
RETURNS TABLE(hid INTEGER, room_number POSITIVE_INTEGER, booking_conflicts BIGINT, renting_conflicts BIGINT) AS
$$
BEGIN
    IF target_checkin >= target_checkout THEN
        RAISE EXCEPTION 'checkin date must be strictly less than checkout date';
    END IF;

    RETURN QUERY
    WITH 
        booking_window AS (
            SELECT booking.hid as _hid, booking.room_number as _room_number, count(ref_id) as _booking_conflicts
            FROM booking
            WHERE target_checkin <= checkout_date AND target_checkout >= checkin_date
            GROUP BY booking.hid, booking.room_number
        ),
        renting_window AS (
            SELECT renting.hid as _hid, renting.room_number as _room_number, count(ref_id) as _renting_conflicts
            FROM renting
            WHERE target_checkin <= checkout_date AND target_checkout >= checkin_date
            GROUP BY renting.hid, renting.room_number
        )
    SELECT
        _hid as hid,
        _room_number as room_number,
        coalesce(_booking_conflicts, 0) as booking_conflicts,
        coalesce(_renting_conflicts, 0) as renting_conflicts
    FROM booking_window FULL OUTER JOIN renting_window USING (_hid, _room_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION num_conflicts FROM PUBLIC;
