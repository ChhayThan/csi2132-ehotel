CREATE FUNCTION check_payment() RETURNS TRIGGER AS
$$
    DECLARE
        price_for_stay INTEGER;
    BEGIN
        SELECT price * (NEW.checkout_date::DATE - NEW.checkin_date::DATE) INTO price_for_stay
        FROM room
        WHERE hid = NEW.hid AND room_number = NEW.room_number;

        IF NEW.payment_amount != price_for_stay THEN
            RAISE integrity_constraint_violation USING MESSAGE = 'payment amount does not match calculated price for stay';
        END IF;

        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER t_check_payment 
AFTER INSERT OR UPDATE ON renting 
FOR EACH ROW EXECUTE FUNCTION check_payment();
