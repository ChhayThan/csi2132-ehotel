CREATE FUNCTION auto_archive_booking() RETURNS TRIGGER AS
$$
    BEGIN

        IF NEW.booking_id IS NOT NULL THEN
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
            FROM booking WHERE ref_id = NEW.booking_id;

            DELETE FROM booking WHERE ref_id = NEW.booking_id;
        END IF;

        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER t_archive_booking 
AFTER INSERT ON renting
FOR EACH ROW EXECUTE FUNCTION auto_archive_booking();
