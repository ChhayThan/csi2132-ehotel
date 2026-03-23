CREATE TABLE IF NOT EXISTS hotel_chain (
    name VARCHAR(255) PRIMARY KEY,
    address TEXT NOT NULL,
    phone_number PHONE_NUMBER NOT NULL
);

CREATE TABLE IF NOT EXISTS hotel_chain_email (
    name VARCHAR(255),
    email_address EMAIL,
	PRIMARY KEY (name, email_address),
    FOREIGN KEY (name) REFERENCES hotel_chain(name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    password CHAR(256) NOT NULL,  /* SHA-256 hashed password */
    role EMPLOYEE_ROLE NOT NULL,
    hid INTEGER
);

CREATE TABLE IF NOT EXISTS hotel (
    hid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rating RATING,
    address_country VARCHAR(255) NOT NULL,
    address_city VARCHAR(255) NOT NULL,
    address_street_address VARCHAR(255) NOT NULL,
    phone_number PHONE_NUMBER NOT NULL,
    image TEXT,
    chain_name VARCHAR(255) NOT NULL,
    manager_eid INTEGER,
    FOREIGN KEY (manager_eid) REFERENCES employee(id) ON DELETE RESTRICT,
    FOREIGN KEY (chain_name) REFERENCES hotel_chain(name) ON DELETE CASCADE
);

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
    FOREIGN KEY (hid, room_number) REFERENCES room(hid, room_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email_address EMAIL UNIQUE NOT NULL,
    password CHAR(256) NOT NULL,  /* SHA-256 hashed password */
    registration_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS booking (
    ref_id SERIAL PRIMARY KEY,
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    customer_id INTEGER,
    creation_date DATE NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    FOREIGN KEY (hid, room_number) REFERENCES room(hid, room_number) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS renting (
    ref_id SERIAL PRIMARY KEY,
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    customer_id INTEGER,
    employee_id INTEGER,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    payment_type VARCHAR(255) NOT NULL,
    payment_amount PRICE NOT NULL,
    FOREIGN KEY (hid, room_number) REFERENCES room(hid, room_number) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS booking_archive (
    ref_id INTEGER,
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    customer_id INTEGER,
    creation_date DATE NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    PRIMARY KEY (ref_id, creation_date)
);

CREATE TABLE IF NOT EXISTS renting_archive (
    ref_id INTEGER,
    hid INTEGER,
    room_number POSITIVE_INTEGER,
    customer_id INTEGER,
    employee_id INTEGER,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    payment_type VARCHAR(255) NOT NULL,
    payment_amount PRICE NOT NULL,
    PRIMARY KEY (ref_id, checkin_date)
);
