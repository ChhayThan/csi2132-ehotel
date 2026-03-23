import os
import csv

with open("load_mock_data.sql", "w") as write_file:

    files = os.listdir(".")

    for filename in ["hotel_chain.csv", "hotel_chain_email.csv", "employee.csv", "hotel.csv", "hotel_email.csv", "room.csv", "room_amenity.csv", "customer.csv", "booking.csv", "renting.csv", "booking_archive.csv", "renting_archive.csv"]:
        if filename in files:
            with open(filename, "r") as f:
                data = csv.reader(f)
                values = []
                for row in data:
                    values.append(", ".join([f"'{value}'" for value in row]))

            print(f"INSERT INTO {filename[:-4]} VALUES ({'), ('.join(values)});", file=write_file)
