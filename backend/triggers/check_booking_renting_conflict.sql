CREATE FUNCTION check_booking_conflict() RETURNS TRIGGER AS 
$$
    DECLARE
        conflicting_booking_count INTEGER;
        conflicting_renting_count INTEGER;
    BEGIN
        SELECT count(*) INTO conflicting_booking_count FROM booking 
        WHERE 
            NEW.checkin_date <= checkout_date AND NEW.checkout_date <= checkin_date 
            AND hid = NEW.hid AND room_number = NEW.room_number
            AND ref_id != NEW.ref_id;

        IF conflicting_booking_count > 0 THEN
            RAISE unique_violation USING MESSAGE = 'Conflicting booking for room in date range';
        END IF;

        SELECT count(*) INTO conflicting_renting_count FROM renting 
        WHERE 
            NEW.checkin_date <= checkout_date AND NEW.checkout_date <= checkin_date 
            AND hid = NEW.hid AND room_number = NEW.room_number;

        IF conflicting_renting_count > 0 THEN
            RAISE unique_violation USING MESSAGE = 'Conflicting renting for room in date range';
        END IF;

        RETURN NULL;
    END
$$ LANGUAGE plpgsql;

CREATE FUNCTION check_renting_conflict() RETURNS TRIGGER AS 
$$
    DECLARE
        conflicting_booking_count INTEGER;
        conflicting_renting_count INTEGER;
    BEGIN
        SELECT count(*) INTO conflicting_booking_count FROM booking 
        WHERE 
            NEW.checkin_date <= checkout_date AND NEW.checkout_date <= checkin_date 
            AND hid = NEW.hid AND room_number = NEW.room_number;

        IF conflicting_booking_count > 0 THEN
            RAISE unique_violation USING MESSAGE = 'Conflicting booking for room in date range';
        END IF;

        SELECT count(*) INTO conflicting_renting_count FROM renting 
        WHERE 
            NEW.checkin_date <= checkout_date AND NEW.checkout_date <= checkin_date 
            AND hid = NEW.hid AND room_number = NEW.room_number
            AND ref_id != NEW.ref_id;

        IF conflicting_renting_count > 0 THEN
            RAISE unique_violation USING MESSAGE = 'Conflicting renting for room in date range';
        END IF;

        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER t_check_booking_conflict 
AFTER INSERT OR UPDATE ON booking 
FOR EACH ROW EXECUTE FUNCTION check_booking_conflict();

CREATE CONSTRAINT TRIGGER t_check_renting_conflict 
AFTER INSERT OR UPDATE ON renting
FOR EACH ROW EXECUTE FUNCTION check_renting_conflict();
