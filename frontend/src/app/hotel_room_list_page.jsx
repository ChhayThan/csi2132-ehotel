import { useEffect, useMemo, useState } from "react";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Link, useParams, useSearchParams } from "react-router-dom";
import HotelRoomListCard from "../components/hotel_room_list_card";
import { getAvailableRooms, getHotelDetails } from "../lib/protected_api";
import { fallbackRoomImage, getRoomType, hasValidStayDates } from "../lib/booking_flow_utils";

const amenityOptions = [
  { value: "WiFi", label: "WiFi" },
  { value: "TV", label: "TV" },
  { value: "AC", label: "Air Conditioning" },
  { value: "Heating", label: "Heating" },
  { value: "Balcony", label: "Balcony" },
  { value: "Fridge", label: "Mini Fridge" },
  { value: "Microwave", label: "Microwave" },
  { value: "Desk", label: "Desk / Workspace" },
  { value: "Safe", label: "In-room Safe" },
  { value: "Parking", label: "Parking Access" },
];

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function parseDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function formatDate(dateString) {
  return longDateFormatter.format(parseDate(dateString));
}

function HotelRoomListPage() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [amenityFilters, setAmenityFilters] = useState([]);
  const [capacityFilter, setCapacityFilter] = useState([]);
  const [maxPrice, setMaxPrice] = useState(450);
  const [sortBy, setSortBy] = useState("recommended");
  const checkinDate = searchParams.get("checkin") ?? "";
  const checkoutDate = searchParams.get("checkout") ?? "";
  const guests = Number(searchParams.get("guests") || "2");
  const hasRequiredParams = Number.isInteger(Number(hotelId)) && hasValidStayDates(checkinDate, checkoutDate);

  useEffect(() => {
    const numericHotelId = Number(hotelId);

    if (!Number.isInteger(numericHotelId) || !hasValidStayDates(checkinDate, checkoutDate)) {
      setHotel(null);
      setRooms([]);
      setErrorMessage("Choose a valid check-in and checkout date before browsing rooms.");
      setIsLoading(false);
      return;
    }

    let isActive = true;

    async function loadHotelRooms() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [hotelData, availableRooms] = await Promise.all([
          getHotelDetails(numericHotelId),
          getAvailableRooms(numericHotelId, checkinDate, checkoutDate),
        ]);

        if (!isActive) {
          return;
        }

        const normalizedRooms = availableRooms.map((room) => ({
          ...room,
          roomType: getRoomType(room.capacity),
          image: room.image || fallbackRoomImage(),
          amenities: room.amenities ?? [],
        }));

        setHotel(hotelData);
        setRooms(normalizedRooms);
        setMaxPrice(
          normalizedRooms.length > 0
            ? Math.max(...normalizedRooms.map((room) => Number(room.price)))
            : 450,
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        setHotel(null);
        setRooms([]);
        setErrorMessage("Unable to load hotel rooms right now.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadHotelRooms();

    return () => {
      isActive = false;
    };
  }, [hotelId, checkinDate, checkoutDate]);

  const filteredRooms = useMemo(() => {
    let nextRooms = rooms.filter((room) => Number(room.price) <= maxPrice);

    if (amenityFilters.length > 0) {
      nextRooms = nextRooms.filter((room) =>
        amenityFilters.some((selectedAmenity) =>
          room.amenities.some((amenity) => amenity.includes(selectedAmenity))
        ),
      );
    }

    if (capacityFilter.length > 0) {
      nextRooms = nextRooms.filter((room) => capacityFilter.includes(room.roomType));
    }

    if (sortBy === "price-low") {
      nextRooms = [...nextRooms].sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "price-high") {
      nextRooms = [...nextRooms].sort((a, b) => Number(b.price) - Number(a.price));
    }

    return nextRooms;
  }, [amenityFilters, capacityFilter, maxPrice, rooms, sortBy]);

  const toggleCapacity = (value) => {
    setCapacityFilter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const toggleAmenity = (value) => {
    setAmenityFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Link to="/" className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <span>&lt;</span>
          <span>back to hotels</span>
        </Link>

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        {!hasRequiredParams ? (
          <div className="rounded-3xl border border-black/8 bg-white p-8 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
            <h1 className="text-3xl font-bold text-slate-950">Missing booking details</h1>
            <p className="mt-3 text-sm text-slate-600">
              A valid check-in and checkout date is required before we can show available rooms.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-primary to-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-muted"
            >
              GO TO MAIN PAGE
            </Link>
          </div>
        ) : null}

        {hotel && hasRequiredParams ? (
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{hotel.name}</h1>
            <div className="flex items-center gap-1 text-sm text-slate-700">
              {Array.from({ length: 5 }).map((_, index) => (
                <StarRoundedIcon key={index} className="text-[16px] text-black" />
              ))}
              <span className="ml-1">({Number(hotel.rating).toFixed(1)})</span>
            </div>
          </div>
          <p className="mt-1 text-lg font-semibold uppercase tracking-wide text-primary">{hotel.chain_name}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <LocationOnOutlinedIcon fontSize="small" />
            <span>
              {hotel.address.city} - {hotel.address.street_address}
            </span>
          </div>
        </section>
        ) : null}

        {hasRequiredParams ? (
        <section className="grid gap-8 xl:grid-cols-[13rem_minmax(0,1fr)]">
          <aside className="h-fit rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2 border-b border-black/10 pb-4 text-sm font-semibold text-slate-700">
              <FilterAltOutlinedIcon fontSize="small" />
              <span>Filters</span>
            </div>

            <div className="mt-5 space-y-6 text-sm text-slate-600">
              <div>
                <p className="font-medium text-slate-900">Amenities</p>
                <div className="mt-2 space-y-2">
                  {amenityOptions.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={amenityFilters.includes(option.value)}
                        onChange={() => toggleAmenity(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium text-slate-900">Capacity</p>
                <div className="mt-2 space-y-2">
                  {["Single", "Double", "Suite"].map((capacity) => (
                    <label key={capacity} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={capacityFilter.includes(capacity)}
                        onChange={() => toggleCapacity(capacity)}
                      />
                      <span>{capacity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">Price Range</p>
                  <span>${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                  className="mt-3 w-full"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>$0</span>
                  <span>$1000</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-3xl font-medium text-slate-950">{filteredRooms.length} rooms found.</h2>
                <p className="text-sm text-slate-500">
                  Available between {formatDate(checkinDate)} to {formatDate(checkoutDate)}.{" "}
                  <button type="button" className="cursor-pointer text-primary underline">
                    Change dates
                  </button>
                </p>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="appearance-none bg-transparent pr-8 text-sm text-slate-500 outline-none"
                >
                  <option value="recommended">Sort by: Recommended</option>
                  <option value="price-low">Sort by: Price low to high</option>
                  <option value="price-high">Sort by: Price high to low</option>
                </select>
                <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="space-y-6">
              {isLoading ? <p className="text-sm text-slate-500">Loading available rooms...</p> : null}
              {filteredRooms.map((room) => (
                <HotelRoomListCard
                  key={`${room.hid}-${room.room_number}`}
                  href={`/rooms/${room.room_number}?hotelId=${room.hid}&checkin=${checkinDate}&checkout=${checkoutDate}&guests=${guests}`}
                  image={room.image}
                  roomNumber={room.room_number}
                  roomType={room.roomType}
                  view={room.view}
                  amenities={room.amenities}
                  price={Number(room.price)}
                  extendable={room.extendable}
                />
              ))}
            </div>
          </div>
        </section>
        ) : null}
      </div>
    </main>
  );
}

export default HotelRoomListPage;
