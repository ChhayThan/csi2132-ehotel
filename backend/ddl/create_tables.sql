CREATE TABLE IF NOT EXISTS hotel_chain (
    name VARCHAR(255) PRIMARY KEY,
    address TEXT NOT NULL,
    phone_number PHONE_NUMBER NOT NULL
);

CREATE TABLE IF NOT EXISTS hotel_chain_email (
    name VARCHAR(255),
    email_address EMAIL,
	PRIMARY KEY (name, email_address),
    FOREIGN KEY (name) REFERENCES hotel_chain(name) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role EMPLOYEE_ROLE NOT NULL,
    hid INTEGER
);

CREATE TABLE IF NOT EXISTS hotel (
    hid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rating RATING NOT NULL,
    address_country CHAR(2) NOT NULL,  -- Alpha-2 country code
    address_city VARCHAR(255) NOT NULL,
    address_street_address VARCHAR(255) NOT NULL,
    phone_number PHONE_NUMBER NOT NULL,
    image TEXT,
    chain_name VARCHAR(255) NOT NULL,
    manager_eid INTEGER UNIQUE,
    FOREIGN KEY (manager_eid) REFERENCES employee(id) ON DELETE SET NULL,
    FOREIGN KEY (chain_name) REFERENCES hotel_chain(name) ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE employee 
ADD FOREIGN KEY (hid) REFERENCES hotel(hid) ON DELETE RESTRICT
DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS hotel_email (
    hid INTEGER,
    email_address EMAIL,
    PRIMARY KEY (hid, email_address),
    FOREIGN KEY (hid) REFERENCES hotel(hid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room (
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    price PRICE NOT NULL,
    capacity CAPACITY NOT NULL,
    view VIEW,
    extendable BOOLEAN NOT NULL,
    problem TEXT,
    image TEXT,
    PRIMARY KEY (hid, room_number),
    FOREIGN KEY (hid) REFERENCES hotel(hid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_amenity (
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    amenity AMENITY,
    PRIMARY KEY (hid, room_number, amenity),
    FOREIGN KEY (hid, room_number) REFERENCES room(hid, room_number) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS customer (
    id VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email_address EMAIL UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    registration_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS booking (
    ref_id SERIAL PRIMARY KEY,
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    customer_id VARCHAR(64),
    creation_date DATE NOT NULL,
    checkin_date DATE NOT NULL CHECK (checkin_date > creation_date),
    checkout_date DATE NOT NULL CHECK (checkout_date > checkin_date),
    FOREIGN KEY (hid, room_number) REFERENCES room(hid, room_number) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS renting (
    ref_id SERIAL PRIMARY KEY,
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    customer_id VARCHAR(64),
    employee_id INTEGER,
    creation_date DATE NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    payment_type VARCHAR(255) NOT NULL,
    payment_amount PRICE NOT NULL,
    booking_id INTEGER,
    booking_creation_date DATE,
    FOREIGN KEY (hid, room_number) REFERENCES room(hid, room_number) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS booking_archive (
    ref_id INTEGER,
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    customer_id VARCHAR(64),
    creation_date DATE NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    PRIMARY KEY (ref_id, creation_date)
);

ALTER TABLE renting 
ADD FOREIGN KEY (booking_id, booking_creation_date) REFERENCES booking_archive(ref_id, creation_date) 
DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS renting_archive (
    ref_id INTEGER,
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    customer_id VARCHAR(64),
    employee_id INTEGER,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    payment_type VARCHAR(255) NOT NULL,
    payment_amount PRICE NOT NULL,
    booking_id INTEGER,
    booking_creation_date DATE,
    FOREIGN KEY (booking_id, booking_creation_date) REFERENCES booking_archive(ref_id, creation_date),
    PRIMARY KEY (ref_id, checkin_date)
);
