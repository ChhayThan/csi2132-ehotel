CREATE FUNCTION auto_archive_booking() RETURNS TRIGGER AS
$$
    BEGIN

        IF NEW.booking_id IS NOT NULL THEN
            PERFORM archive_booking(NEW.booking_id);
        END IF;

        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER t_archive_booking 
AFTER INSERT ON renting
FOR EACH ROW EXECUTE FUNCTION auto_archive_booking();
