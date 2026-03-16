CREATE TABLE IF NOT EXISTS hotel_chain (
    name VARCHAR(255) PRIMARY KEY,
    address TEXT NOT NULL,
    phone_number CHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS hotel_chain_email (
    chain_name VARCHAR(255) PRIMARY KEY,
    email_address VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (chain_name) REFERENCES hotel_chain(name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    password CHAR(256) NOT NULL,  /* SHA-256 hashed password */
    role VARCHAR(20) NOT NULL,
    hid INTEGER NOT NULL,
    FOREIGN KEY (hid) REFERENCES hotel(hid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hotel (
    hid SERIAL PRIMARY KEY,
    rating INTEGER,
    address_country VARCHAR(255) NOT NULL,
    address_city VARCHAR(255) NOT NULL,
    address_street_address VARCHAR(255) NOT NULL,
    phone_number CHAR(10) NOT NULL,
    image TEXT,
    chain_name VARCHAR(255) NOT NULL,
    manager_eid INTEGER,
    FOREIGN KEY (manager_eid) REFERENCES employee(id) ON DELETE RESTRICT,
    FOREIGN KEY (chain_name) REFERENCES hotel_chain(name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hotel_email (
    hid INTEGER PRIMARY KEY,
    email_address VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (hid) REFERENCES hotel(hid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room (
    hid INTEGER PRIMARY KEY,
    room_number INTEGER PRIMARY KEY,
    price DECIMAL(10, 2) NOT NULL,
    room_type VARCHAR(20) NOT NULL,
    view VARCHAR(20) NOT NULL,
    extendable BOOLEAN NOT NULL,
    problem TEXT,
    image TEXT,
    FOREIGN KEY (hid) REFERENCES hotel(hid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_amenity (
    hid INTEGER PRIMARY KEY,
    room_number INTEGER PRIMARY KEY,
    amenity VARCHAR(20) PRIMARY KEY,
    FOREIGN KEY (hid, room_number) REFERENCES room(hid, room_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    password CHAR(256) NOT NULL  /* SHA-256 hashed password */
    registration_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS booking (
    hid INTEGER PRIMARY KEY,
    room_number INTEGER PRIMARY KEY,
    customer_id INTEGER PRIMARY KEY,
    creation_date DATE NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    FOREIGN KEY (hid, room_number) REFERENCES room(hid, room_number) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS renting (
    hid INTEGER PRIMARY KEY,
    room_number INTEGER PRIMARY KEY,
    customer_id INTEGER PRIMARY KEY,
    employee_id INTEGER PRIMARY KEY,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    FOREIGN KEY (hid, room_number) REFERENCES room(hid, room_number) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS booking_archive (
    hid INTEGER PRIMARY KEY,
    room_number INTEGER PRIMARY KEY,
    customer_id INTEGER PRIMARY KEY,
    creation_date DATE PRIMARY KEY,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS renting_archive (
    hid INTEGER PRIMARY KEY,
    room_number INTEGER PRIMARY KEY,
    customer_id INTEGER PRIMARY KEY,
    employee_id INTEGER PRIMARY KEY,
    checkin_date DATE PRIMARY KEY,
    checkout_date DATE NOT NULL
);
