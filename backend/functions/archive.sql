CREATE OR REPLACE FUNCTION archive_booking(booking_id INTEGER) RETURNS INTEGER AS
$$
BEGIN
    INSERT INTO booking_archive (
        ref_id,
        hid,
        room_number,
        customer_id,
        creation_date,
        checkin_date,
        checkout_date
    )
    SELECT
        ref_id,
        hid,
        room_number,
        customer_id,
        creation_date,
        checkin_date,
        checkout_date
    FROM booking WHERE ref_id = booking_id;

    DELETE FROM booking WHERE ref_id = booking_id;

    RETURN booking_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION archive_renting(renting_id INTEGER) RETURNS INTEGER AS
$$
BEGIN
    INSERT INTO renting_archive (
        ref_id,
        hid,
        room_number,
        customer_id,
        emloyee_id,
        creation_date,
        checkin_date,
        checkout_date,
        payment_type,
        payment_amount,
        booking_id,
        booking_creation_date
    )
    SELECT
        ref_id,
        hid,
        room_number,
        customer_id,
        emloyee_id,
        creation_date,
        checkin_date,
        checkout_date,
        payment_type,
        payment_amount,
        booking_id,
        booking_creation_date
    FROM renting WHERE ref_id = renting_id;

    DELETE FROM renting WHERE ref_id = renting_id;

    RETURN renting_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION archive_on_date_passed() RETURNS INTEGER AS 
$$
DECLARE
    num_archived_bookings BIGINT;
    num_archived_rentings BIGINT;
BEGIN
    -- archive bookings and rentings passed date and return number of records archived

    WITH archived_booking_ids AS (
        SELECT archive_booking(ref_id) 
        FROM booking
        WHERE checkin_date < CURRENT_DATE
    )
    SELECT count(*) INTO num_archived_bookings FROM archived_booking_ids;

    WITH archived_renting_ids AS (
        SELECT archive_renting(ref_id)
        FROM renting
        WHERE checkout_date < CURRENT_DATE
    )
    SELECT count(*) INTO num_archived_rentings FROM archived_renting_ids;

    RETURN num_archived_bookings + num_archived_rentings;

END;
$$ LANGUAGE plpgsql;
