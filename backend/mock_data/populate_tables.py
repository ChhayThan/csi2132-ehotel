import os
import csv
from pathlib import Path

if __name__ == '__main__':
    base_dir = Path(__file__).resolve().parent

    with open(base_dir / "load_mock_data.sql", "w") as write_file:

        files = os.listdir(base_dir)

        for filename in [
            "hotel_chain.csv",
            "hotel_chain_email.csv",
            "employee.csv",
            "hotel.csv",
            "hotel_email.csv",
            "room.csv",
            "room_amenity.csv",
            "customer.csv",
            "booking.csv",
            "renting.csv",
            "booking_archive.csv",
            "renting_archive.csv"
        ]:
            if filename in files:
                with open(base_dir / filename, "r") as f:
                    data = csv.reader(f)
                    values = []
                    for row in data:
                        values.append(", ".join([f"'{value}'" for value in row]))

                print(f"INSERT INTO {filename[:-4]} VALUES ({'), ('.join(values)});", file=write_file)
