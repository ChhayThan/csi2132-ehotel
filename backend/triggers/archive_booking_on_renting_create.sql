CREATE FUNCTION auto_archive_booking() RETURNS TRIGGER AS
$$
    BEGIN

        IF NEW.booking_id IS NOT NULL THEN
            WITH deleted_rows AS (
                DELETE FROM booking WHERE ref_id = NEW.booking_id
                RETURNING (
                    ref_id,
                    hid,
                    room_number,
                    customer_id,
                    creation_date,
                    checkin_date,
                    checkout_date
                )
            )
            INSERT INTO booking_archive (
                ref_id,
                hid,
                room_number,
                customer_id,
                creation_date,
                checkin_date,
                checkout_date
            )
            SELECT * FROM deleted_rows;
        END IF;

        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER t_archive_booking 
AFTER INSERT ON renting
FOR EACH ROW EXECUTE FUNCTION auto_archive_booking();
