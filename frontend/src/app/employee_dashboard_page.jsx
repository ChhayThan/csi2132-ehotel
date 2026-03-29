import { useMemo, useState } from "react";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ArchivedBooking from "../components/archived_booking";
import AvailableRoom from "../components/available_room";
import BookingSearchBar from "../components/booking_search_bar";
import CurrentBooking from "../components/current_booking";
import EmployeeInfo from "../components/employee_info";
import RentModal from "../components/rent_modal";
import Navbar from "../components/navbar/navbar";

const availableRooms = [
  { roomNumber: 123, roomType: "Double", price: 299, amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"] },
  { roomNumber: 232, roomType: "Single", price: 299, amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"] },
  { roomNumber: 233, roomType: "Single", price: 299, amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"] },
  { roomNumber: 555, roomType: "Suite", price: 299, amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"] },
  { roomNumber: 579, roomType: "Suite", price: 299, amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"] },
  { roomNumber: 601, roomType: "Double", price: 329, amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"] },
  { roomNumber: 720, roomType: "Suite", price: 389, amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"] },
];

const currentBookings = [
  { roomNumber: 124, roomType: "Double", amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"], guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)" },
  { roomNumber: 214, roomType: "Double", amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"], guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)" },
  { roomNumber: 102, roomType: "Suite", amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"], guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)" },
  { roomNumber: 12, roomType: "Double", amenities: ["Ocean View", "TV", "WiFi", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "+16"], guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)" },
];

const archivedBookings = [
  { roomNumber: 124, roomType: "Double", guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)", total: 675.74 },
  { roomNumber: 214, roomType: "Double", guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 18, 2026", stayDates: "March 1 - March 4, 2026 (4 days)", total: 675.74 },
  { roomNumber: 102, roomType: "Suite", guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 15, 2026", stayDates: "February 22 - February 26, 2026 (5 days)", total: 975.74 },
  { roomNumber: 12, roomType: "Double", guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 12, 2026", stayDates: "February 16 - February 18, 2026 (3 days)", total: 475.74 },
];

const tabs = [
  { id: "available", label: "View Available Rooms" },
  { id: "current", label: "View Current Bookings" },
  { id: "archived", label: "View Archived Bookings" },
];

function EmployeeDashboardPage() {
  const [activeTab, setActiveTab] = useState("available");
  const [amenityFilter, setAmenityFilter] = useState("None");
  const [capacityFilters, setCapacityFilters] = useState([]);
  const [maxPrice, setMaxPrice] = useState(450);
  const [bookingSearch, setBookingSearch] = useState("");
  const [archivedSearch, setArchivedSearch] = useState("");
  const [archivedDate, setArchivedDate] = useState("");
  const [rentTarget, setRentTarget] = useState(null);

  const filteredAvailableRooms = useMemo(() => {
    let rooms = availableRooms.filter((room) => room.price <= maxPrice);

    if (amenityFilter !== "None") {
      rooms = rooms.filter((room) => room.amenities.some((amenity) => amenity.includes(amenityFilter)));
    }

    if (capacityFilters.length > 0) {
      rooms = rooms.filter((room) => capacityFilters.includes(room.roomType));
    }

    return rooms;
  }, [amenityFilter, capacityFilters, maxPrice]);

  const filteredCurrentBookings = useMemo(
    () =>
      currentBookings.filter((booking) =>
        `${booking.guestName} ${booking.guestEmail}`.toLowerCase().includes(bookingSearch.toLowerCase())
      ),
    [bookingSearch]
  );

  const filteredArchivedBookings = useMemo(
    () =>
      archivedBookings.filter((booking) => {
        const searchMatch = `${booking.roomNumber}`.includes(archivedSearch.trim());
        const dateMatch = !archivedDate || archivedDate === "2026-03-03";
        return searchMatch && dateMatch;
      }),
    [archivedSearch, archivedDate]
  );

  const toggleCapacity = (value) => {
    setCapacityFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const openAvailableRent = (room) => {
    setRentTarget({
      is_booked: false,
      room_num: room.roomNumber,
      subtotal: 598,
      total: 675.74,
    });
  };

  const openCurrentRent = (booking) => {
    setRentTarget({
      is_booked: true,
      room_num: booking.roomNumber,
      name: booking.guestName,
      email: booking.guestEmail,
      subtotal: 598,
      total: 675.74,
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)]">
      <Navbar user_type="Employee" user_name="Eric Chhour" currency="CAD" setCurrency={() => {}} />

      <main className="px-4 pb-12 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
          <EmployeeInfo
            employeeName="Eric Chhour"
            employeeId="E011122233"
            hotelName="The Grand Azure"
            chainName="Azure Resorts"
            address="Toronto - 100 King Street"
          />

          <section className="self-center">
            <div className="flex flex-wrap gap-8 border-b border-black/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer border-b-4 px-3 pb-3 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {activeTab === "available" ? (
            <section className="grid gap-8 xl:grid-cols-[16rem_minmax(0,1fr)]">
              <aside className="h-fit rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-2 border-b border-black/10 pb-4 text-sm font-semibold text-slate-700">
                  <FilterAltOutlinedIcon fontSize="small" />
                  <span>Filters</span>
                </div>
                <div className="mt-5 space-y-5 text-sm text-slate-600">
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
                            checked={capacityFilters.includes(capacity)}
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-slate-950">
                      {filteredAvailableRooms.length} rooms available.
                    </h3>
                    <p className="text-sm text-slate-500">
                      Today&apos;s available rooms (March 30, 2026).
                    </p>
                  </div>
                  <div className="relative">
                    <select className="appearance-none bg-transparent pr-8 text-sm text-slate-500 outline-none">
                      <option>Sort by: Recommended</option>
                    </select>
                    <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredAvailableRooms.map((room) => (
                    <AvailableRoom key={room.roomNumber} {...room} onManage={() => openAvailableRent(room)} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "current" ? (
            <section className="space-y-6">
              <div className="mx-auto w-full max-w-3xl">
                <BookingSearchBar
                  searchValue={bookingSearch}
                  onSearchChange={setBookingSearch}
                  searchPlaceholder="Search by customer name"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-3xl font-bold tracking-tight text-slate-950">
                  {filteredCurrentBookings.length} bookings found.
                </h3>
                <div className="relative">
                  <select className="appearance-none bg-transparent pr-8 text-sm text-slate-500 outline-none">
                    <option>Sort by: Recent</option>
                  </select>
                  <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-4">
                {filteredCurrentBookings.map((booking) => (
                  <CurrentBooking
                    key={`${booking.roomNumber}-${booking.guestEmail}`}
                    {...booking}
                    onRent={() => openCurrentRent(booking)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === "archived" ? (
            <section className="space-y-6">
              <div className="mx-auto w-full max-w-4xl">
                <BookingSearchBar
                  searchValue={archivedSearch}
                  onSearchChange={setArchivedSearch}
                  searchPlaceholder="Search by room number"
                  dateValue={archivedDate}
                  onDateChange={setArchivedDate}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-3xl font-bold tracking-tight text-slate-950">
                  {filteredArchivedBookings.length} archived bookings found.
                </h3>
                <div className="relative">
                  <select className="appearance-none bg-transparent pr-8 text-sm text-slate-500 outline-none">
                    <option>Sort by: Recent</option>
                  </select>
                  <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-4">
                {filteredArchivedBookings.map((booking, index) => (
                  <ArchivedBooking key={`${booking.roomNumber}-${index}`} {...booking} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      {rentTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-8 backdrop-blur-[2px]">
          <RentModal
            {...rentTarget}
            setIsActive={() => setRentTarget(null)}
          />
        </div>
      ) : null}
    </div>
  );
}

export default EmployeeDashboardPage;
