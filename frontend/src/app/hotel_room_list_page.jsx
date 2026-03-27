import { useMemo, useState } from "react";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Link } from "react-router-dom";
import HotelRoomListCard from "../components/hotel_room_list_card";
import { mockHotel, mockRooms } from "./mock_room_data";

function HotelRoomListPage() {
  const [amenityFilter, setAmenityFilter] = useState("None");
  const [capacityFilter, setCapacityFilter] = useState([]);
  const [maxPrice, setMaxPrice] = useState(450);
  const [sortBy, setSortBy] = useState("recommended");

  const filteredRooms = useMemo(() => {
    let rooms = mockRooms.filter((room) => room.price <= maxPrice);

    if (amenityFilter !== "None") {
      rooms = rooms.filter((room) => room.amenities.some((amenity) => amenity.includes(amenityFilter)));
    }

    if (capacityFilter.length > 0) {
      rooms = rooms.filter((room) => capacityFilter.includes(room.roomType));
    }

    if (sortBy === "price-low") {
      rooms = [...rooms].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      rooms = [...rooms].sort((a, b) => b.price - a.price);
    }

    return rooms;
  }, [amenityFilter, capacityFilter, maxPrice, sortBy]);

  const toggleCapacity = (value) => {
    setCapacityFilter((current) =>
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

        <section>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{mockHotel.name}</h1>
            <div className="flex items-center gap-1 text-sm text-slate-700">
              {Array.from({ length: 5 }).map((_, index) => (
                <StarRoundedIcon key={index} className="text-[16px] text-black" />
              ))}
              <span className="ml-1">({mockHotel.rating.toFixed(1)})</span>
            </div>
          </div>
          <p className="mt-1 text-lg font-semibold uppercase tracking-wide text-primary">{mockHotel.chainName}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <LocationOnOutlinedIcon fontSize="small" />
            <span>
              {mockHotel.city} - {mockHotel.address}
            </span>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[13rem_minmax(0,1fr)]">
          <aside className="h-fit rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2 border-b border-black/10 pb-4 text-sm font-semibold text-slate-700">
              <FilterAltOutlinedIcon fontSize="small" />
              <span>Filters</span>
            </div>

            <div className="mt-5 space-y-6 text-sm text-slate-600">
              <div>
                <p className="font-medium text-slate-900">Amenities</p>
                <div className="relative mt-2">
                  <select
                    value={amenityFilter}
                    onChange={(event) => setAmenityFilter(event.target.value)}
                    className="w-full appearance-none rounded-lg border border-black/12 px-3 py-2 pr-10 outline-none"
                  >
                    <option>None</option>
                    <option>WiFi</option>
                    <option>Balcony</option>
                    <option>Kitchen</option>
                    <option>Ocean View</option>
                  </select>
                  <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  Available between March 6, 2026 to March 9, 2026.{" "}
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
              {filteredRooms.map((room) => (
                <HotelRoomListCard
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  image={room.image}
                  roomNumber={room.roomNumber}
                  roomType={room.roomType}
                  view={room.view}
                  amenities={room.amenities}
                  price={room.price}
                  extendable={room.extendable}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default HotelRoomListPage;
