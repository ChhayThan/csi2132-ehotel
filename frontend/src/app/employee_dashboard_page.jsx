import { useState } from "react";
import ArchivedBooking from "../components/archived_booking";
import AvailableRoom from "../components/available_room";
import BookingSearchBar from "../components/booking_search_bar";
import CurrentBooking from "../components/current_booking";
import EmployeeInfo from "../components/employee_info";
import Navbar from "../components/navbar/navbar";

const availableRooms = [
  { roomNumber: 123, roomType: "Double", price: 299, amenities: ["Ocean View", "TV", "AC", "Kitchen", "Balcony", "WiFi"] },
  { roomNumber: 232, roomType: "Single", price: 299, amenities: ["City View", "TV", "Desk", "Heating", "WiFi"] },
  { roomNumber: 233, roomType: "Single", price: 299, amenities: ["City View", "TV", "Closet", "Heating", "WiFi"] },
  { roomNumber: 555, roomType: "Suite", price: 399, amenities: ["Ocean View", "TV", "Kitchen", "Balcony", "Microwave", "WiFi"] },
  { roomNumber: 579, roomType: "Suite", price: 429, amenities: ["Mountain View", "TV", "Kitchen", "Safe", "Desk", "WiFi"] },
];

const currentBookings = [
  { roomNumber: 124, roomType: "Double", amenities: ["Ocean View", "TV", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "WiFi"], guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)" },
  { roomNumber: 214, roomType: "Double", amenities: ["Ocean View", "TV", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "WiFi"], guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)" },
  { roomNumber: 102, roomType: "Suite", amenities: ["Ocean View", "TV", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "WiFi"], guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)" },
  { roomNumber: 12, roomType: "Double", amenities: ["Ocean View", "TV", "Kitchen", "Toaster", "Balcony", "Heating", "AC", "WiFi"], guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)" },
];

const archivedBookings = [
  { roomNumber: 124, roomType: "Double", guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)", total: 675.74 },
  { roomNumber: 124, roomType: "Double", guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)", total: 675.74 },
  { roomNumber: 124, roomType: "Double", guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)", total: 675.74 },
  { roomNumber: 124, roomType: "Double", guestName: "Leonardo Atalla", guestEmail: "myemail@gmail.com", bookedDate: "Feb 20, 2026", stayDates: "March 3 - March 6, 2026 (4 days)", total: 675.74 },
];

const tabs = [
  { id: "available", label: "View Available Rooms" },
  { id: "current", label: "View Current Bookings" },
  { id: "archived", label: "View Archived Bookings" },
];

function EmployeeDashboardPage() {
  const [activeTab, setActiveTab] = useState("available");
  const [roomSearch, setRoomSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [archivedSearch, setArchivedSearch] = useState("");
  const [archivedDate, setArchivedDate] = useState("");

  const filteredAvailableRooms = availableRooms.filter((room) =>
    `${room.roomNumber}`.includes(roomSearch.trim())
  );

  const filteredCurrentBookings = currentBookings.filter((booking) =>
    `${booking.guestName} ${booking.guestEmail}`.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  const filteredArchivedBookings = archivedBookings.filter((booking) => {
    const searchMatch = `${booking.roomNumber}`.includes(archivedSearch.trim());
    const dateMatch = !archivedDate || archivedDate === "2026-03-03";
    return searchMatch && dateMatch;
  });

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
                  className={`border-b-4 px-3 pb-3 text-sm font-medium transition ${
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
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Filters
                </p>
                <div className="mt-5 space-y-5 text-sm text-slate-600">
                  <div>
                    <p className="font-medium text-slate-900">Amenities</p>
                    <select className="mt-2 w-full rounded-lg border border-black/12 px-3 py-2 outline-none">
                      <option>None</option>
                      <option>WiFi</option>
                      <option>Balcony</option>
                      <option>Kitchen</option>
                    </select>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Capacity</p>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-2"><input type="checkbox" /> Single</label>
                      <label className="flex items-center gap-2"><input type="checkbox" /> Double</label>
                      <label className="flex items-center gap-2"><input type="checkbox" /> Suite</label>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">Price Range</p>
                      <span>$450</span>
                    </div>
                    <input type="range" min="0" max="1000" defaultValue="450" className="mt-3 w-full" />
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
                      Today&apos;s available rooms (March 10, 2026)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredAvailableRooms.map((room) => (
                    <AvailableRoom key={room.roomNumber} {...room} />
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
                <p className="text-sm text-slate-500">Sort by: Recent</p>
              </div>

              <div className="space-y-4">
                {filteredCurrentBookings.map((booking) => (
                  <CurrentBooking
                    key={`${booking.roomNumber}-${booking.guestEmail}`}
                    {...booking}
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
                <p className="text-sm text-slate-500">Sort by: Recent</p>
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
    </div>
  );
}

export default EmployeeDashboardPage;
