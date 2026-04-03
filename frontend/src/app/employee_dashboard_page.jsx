import { useCallback, useEffect, useMemo, useState } from "react";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ArchivedBooking from "../components/archived_booking";
import AvailableRoom from "../components/available_room";
import BookingSearchBar from "../components/booking_search_bar";
import CurrentBooking from "../components/current_booking";
import CurrentRenting from "../components/current_renting";
import EmployeeInfo from "../components/employee_info";
import RentModal from "../components/rent_modal";
import Navbar from "../components/navbar/navbar";
import { isUnauthorizedError, useAuth } from "../context/auth_context";
import {
  convertEmployeeBookingToRenting,
  createEmployeeDirectRenting,
  getAvailableRooms,
  getEmployeeHotelBookings,
  getEmployeeHotelRentings,
  getHotelDetails,
  lookupEmployeeCustomerByEmail,
  getRoomDetails,
} from "../lib/protected_api";

const tabs = [
  { id: "available", label: "View Available Rooms" },
  { id: "currentBookings", label: "View Current Bookings" },
  { id: "archivedBookings", label: "View Archived Bookings" },
  { id: "currentRentings", label: "View Current Rentings" },
  { id: "archivedRentings", label: "View Archived Rentings" },
];

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

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function parseDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function formatDate(dateString) {
  return shortDateFormatter.format(parseDate(dateString));
}

function formatStayDates(checkinDate, checkoutDate) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const nights = Math.max(
    1,
    Math.round((parseDate(checkoutDate).getTime() - parseDate(checkinDate).getTime()) / millisecondsPerDay),
  );

  return `${formatDate(checkinDate)} - ${formatDate(checkoutDate)} (${nights} day${nights > 1 ? "s" : ""})`;
}

function formatIsoDate(date) {
  return date.toISOString().split("T")[0];
}

function getRoomTypeFromCapacity(capacity) {
  return capacity === 4 ? "Suite" : capacity === 2 ? "Double" : "Single";
}

function mapRoomAmenities(room, roomDetail) {
  const detailAmenities = roomDetail?.amenities ?? room.amenities ?? [];
  return [`${room.view} View`, ...detailAmenities].slice(0, 9);
}

function calculateNights(checkinDate, checkoutDate) {
  return Math.max(
    1,
    Math.round((parseDate(checkoutDate).getTime() - parseDate(checkinDate).getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function EmployeeDashboardPage() {
  const { user, token, displayName, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("available");
  const [amenityFilters, setAmenityFilters] = useState([]);
  const [capacityFilters, setCapacityFilters] = useState([]);
  const [maxPrice, setMaxPrice] = useState(450);
  const [bookingSearch, setBookingSearch] = useState("");
  const [archivedBookingSearch, setArchivedBookingSearch] = useState("");
  const [archivedBookingDate, setArchivedBookingDate] = useState("");
  const [currentRentingSearch, setCurrentRentingSearch] = useState("");
  const [archivedRentingSearch, setArchivedRentingSearch] = useState("");
  const [archivedRentingDate, setArchivedRentingDate] = useState("");
  const [rentTarget, setRentTarget] = useState(null);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [archivedBookings, setArchivedBookings] = useState([]);
  const [currentRentings, setCurrentRentings] = useState([]);
  const [archivedRentings, setArchivedRentings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboardData = useCallback(async () => {
    if (!user?.hid || !token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    try {
      const hotelId = user.hid;
      const [hotel, availableRows, currentBookingRows, archivedBookingRows, currentRentingRows, archivedRentingRows] = await Promise.all([
        getHotelDetails(hotelId),
        getAvailableRooms(hotelId, formatIsoDate(today), formatIsoDate(tomorrow)),
        getEmployeeHotelBookings(hotelId, false, token),
        getEmployeeHotelBookings(hotelId, true, token),
        getEmployeeHotelRentings(hotelId, false, token),
        getEmployeeHotelRentings(hotelId, true, token),
      ]);

      const roomDetailPromises = [
        ...availableRows.map((room) => getRoomDetails(hotelId, room.room_number)),
        ...currentBookingRows.map((booking) => getRoomDetails(hotelId, booking.room_number)),
        ...archivedBookingRows.map((booking) => getRoomDetails(hotelId, booking.room_number)),
        ...currentRentingRows.map((renting) => getRoomDetails(hotelId, renting.room_number)),
        ...archivedRentingRows.map((renting) => getRoomDetails(hotelId, renting.room_number)),
      ];

      const roomDetails = await Promise.all(roomDetailPromises);
      let roomDetailIndex = 0;

      const availableData = availableRows.map((room) => {
        const roomDetail = roomDetails[roomDetailIndex++];
        return {
          roomNumber: room.room_number,
          roomType: getRoomTypeFromCapacity(room.capacity),
          price: Number(room.price),
          amenities: mapRoomAmenities(room, roomDetail),
        };
      });

      const currentData = currentBookingRows.map((booking) => {
        const roomDetail = roomDetails[roomDetailIndex++];
        return {
          bookingId: booking.ref_id,
          roomNumber: booking.room_number,
          roomType: getRoomTypeFromCapacity(roomDetail.capacity),
          amenities: mapRoomAmenities(roomDetail, roomDetail),
          customerId: booking.customer_id,
          bookedDate: formatDate(booking.creation_date),
          checkinDate: booking.checkin_date,
          checkoutDate: booking.checkout_date,
          stayDates: formatStayDates(booking.checkin_date, booking.checkout_date),
          nightlyRate: Number(roomDetail.price),
          subtotal: Number(roomDetail.price) * calculateNights(booking.checkin_date, booking.checkout_date),
        };
      });

      const archivedBookingData = archivedBookingRows.map((booking) => {
        const roomDetail = roomDetails[roomDetailIndex++];
        return {
          roomNumber: booking.room_number,
          roomType: getRoomTypeFromCapacity(roomDetail.capacity),
          customerId: booking.customer_id,
          bookedDate: formatDate(booking.creation_date),
          rawBookedDate: booking.creation_date,
          stayDates: formatStayDates(booking.checkin_date, booking.checkout_date),
          total: Number(roomDetail.price) * calculateNights(booking.checkin_date, booking.checkout_date),
        };
      });

      const currentRentingData = currentRentingRows.map((renting) => {
        const roomDetail = roomDetails[roomDetailIndex++];
        return {
          roomNumber: renting.room_number,
          roomType: getRoomTypeFromCapacity(roomDetail.capacity),
          amenities: mapRoomAmenities(roomDetail, roomDetail),
          customerId: renting.customer_id,
          employeeName: displayName || `Employee ${renting.employee_id}`,
          employeeId: String(renting.employee_id),
          stayDates: formatStayDates(renting.checkin_date, renting.checkout_date),
        };
      });

      const archivedRentingData = archivedRentingRows.map((renting) => {
        const roomDetail = roomDetails[roomDetailIndex++];
        return {
          roomNumber: renting.room_number,
          roomType: getRoomTypeFromCapacity(roomDetail.capacity),
          customerId: renting.customer_id,
          bookedDate: formatDate(renting.checkin_date),
          rawBookedDate: renting.checkin_date,
          stayDates: formatStayDates(renting.checkin_date, renting.checkout_date),
          total: Number(renting.payment_amount),
        };
      });

      setHotelInfo(hotel);
      setAvailableRooms(availableData);
      setCurrentBookings(currentData);
      setArchivedBookings(archivedBookingData);
      setCurrentRentings(currentRentingData);
      setArchivedRentings(archivedRentingData);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        logout();
        return;
      }

      setErrorMessage("Unable to load the employee dashboard right now.");
    } finally {
      setIsLoading(false);
    }
  }, [logout, token, user]);

  useEffect(() => {
    let isActive = true;

    if (!user?.hid || !token) {
      return undefined;
    }

    loadDashboardData().catch(() => {
      if (!isActive) {
        return;
      }
    });

    return () => {
      isActive = false;
    };
  }, [loadDashboardData, token, user]);

  const filteredAvailableRooms = useMemo(() => {
    let rooms = availableRooms.filter((room) => room.price <= maxPrice);

    if (amenityFilters.length > 0) {
      rooms = rooms.filter((room) =>
        amenityFilters.some((selectedAmenity) =>
          room.amenities.some((amenity) => amenity.includes(selectedAmenity))
        )
      );
    }

    if (capacityFilters.length > 0) {
      rooms = rooms.filter((room) => capacityFilters.includes(room.roomType));
    }

    return rooms;
  }, [amenityFilters, availableRooms, capacityFilters, maxPrice]);

  const filteredCurrentBookings = useMemo(
    () =>
      currentBookings.filter((booking) =>
        `${booking.customerId}`.toLowerCase().includes(bookingSearch.toLowerCase())
      ),
    [bookingSearch, currentBookings]
  );

  const filteredArchivedBookings = useMemo(
    () =>
      archivedBookings.filter((booking) => {
        const searchMatch = `${booking.roomNumber}`.includes(archivedBookingSearch.trim());
        const dateMatch = !archivedBookingDate || archivedBookingDate === booking.rawBookedDate;
        return searchMatch && dateMatch;
      }),
    [archivedBookingDate, archivedBookings, archivedBookingSearch]
  );

  const filteredCurrentRentings = useMemo(
    () =>
      currentRentings.filter((renting) =>
        `${renting.customerId} ${renting.roomNumber}`.toLowerCase().includes(currentRentingSearch.toLowerCase())
      ),
    [currentRentingSearch, currentRentings]
  );

  const filteredArchivedRentings = useMemo(
    () =>
      archivedRentings.filter((renting) => {
        const searchMatch = `${renting.roomNumber}`.includes(archivedRentingSearch.trim());
        const dateMatch = !archivedRentingDate || archivedRentingDate === renting.rawBookedDate;
        return searchMatch && dateMatch;
      }),
    [archivedRentingDate, archivedRentingSearch, archivedRentings]
  );

  const toggleCapacity = (value) => {
    setCapacityFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const toggleAmenity = (value) => {
    setAmenityFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const openAvailableRent = (room) => {
    setRentTarget({
      is_booked: false,
      hotel_id: user?.hid,
      room_num: room.roomNumber,
      subtotal: room.price,
      total: room.price,
    });
  };

  const openCurrentRent = (booking) => {
    setRentTarget({
      is_booked: true,
      booking_id: booking.bookingId,
      room_num: booking.roomNumber,
      name: booking.customerId,
      email: booking.customerId,
      checkinDate: booking.checkinDate,
      initialCheckoutDate: booking.checkoutDate,
      subtotal: booking.nightlyRate,
      total: booking.subtotal,
    });
  };

  const handleLookupCustomer = async (email) => {
    if (!token) {
      throw new Error("You must be signed in to look up a customer.");
    }

    return lookupEmployeeCustomerByEmail(email, token);
  };

  const handleDirectRent = async (payload) => {
    if (!token || !user?.hid) {
      throw new Error("You must be signed in to create a renting.");
    }

    await createEmployeeDirectRenting(
      {
        hid: user.hid,
        room_number: rentTarget.room_num,
        customer: {
          email: payload.email,
          first_name: payload.firstName,
          last_name: payload.lastName,
          drivers_license: payload.driversLicense,
          address: payload.address,
          password: payload.password,
        },
        checkout_date: payload.checkoutDate,
        payment_type: payload.paymentType,
        payment_amount: payload.paymentAmount,
      },
      token,
    );

    await loadDashboardData();
  };

  const handleConvertBooking = async (payload) => {
    if (!token || !rentTarget?.booking_id) {
      throw new Error("Missing booking information for renting conversion.");
    }

    await convertEmployeeBookingToRenting(
      {
        booking_id: rentTarget.booking_id,
        checkout_date: payload.checkoutDate,
        payment_type: payload.paymentType,
        payment_amount: payload.paymentAmount,
      },
      token,
    );

    await loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)]">
      <Navbar
        user_type="Employee"
        user_name={displayName}
        currency="CAD"
        setCurrency={() => {}}
        onSignOut={logout}
      />

      <main className="px-4 pb-12 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
          <EmployeeInfo
            employeeName={displayName}
            employeeId={user?.id ?? ""}
            hotelName={hotelInfo?.name ?? "Loading hotel..."}
            chainName={hotelInfo?.chain_name ?? ""}
            address={
              hotelInfo
                ? `${hotelInfo.address.city} - ${hotelInfo.address.street_address}`
                : ""
            }
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

          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
          {isLoading ? <p className="text-sm text-slate-500">Loading dashboard...</p> : null}

          {!isLoading && activeTab === "available" ? (
            <section className="grid gap-8 xl:grid-cols-[16rem_minmax(0,1fr)]">
              <aside className="h-fit rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-2 border-b border-black/10 pb-4 text-sm font-semibold text-slate-700">
                  <FilterAltOutlinedIcon fontSize="small" />
                  <span>Filters</span>
                </div>
                <div className="mt-5 space-y-5 text-sm text-slate-600">
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
                      Today&apos;s available rooms ({shortDateFormatter.format(new Date())}).
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

          {!isLoading && activeTab === "currentBookings" ? (
            <section className="space-y-6">
              <div className="mx-auto w-full max-w-3xl">
                <BookingSearchBar
                  searchValue={bookingSearch}
                  onSearchChange={setBookingSearch}
                  searchPlaceholder="Search by customer ID"
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
                    key={`${booking.roomNumber}-${booking.customerId}`}
                    {...booking}
                    onRent={() => openCurrentRent(booking)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {!isLoading && activeTab === "archivedBookings" ? (
            <section className="space-y-6">
              <div className="mx-auto w-full max-w-4xl">
                <BookingSearchBar
                  searchValue={archivedBookingSearch}
                  onSearchChange={setArchivedBookingSearch}
                  searchPlaceholder="Search by room number"
                  dateValue={archivedBookingDate}
                  onDateChange={setArchivedBookingDate}
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

          {!isLoading && activeTab === "currentRentings" ? (
            <section className="space-y-6">
              <div className="mx-auto w-full max-w-3xl">
                <BookingSearchBar
                  searchValue={currentRentingSearch}
                  onSearchChange={setCurrentRentingSearch}
                  searchPlaceholder="Search by guest or room number"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-3xl font-bold tracking-tight text-slate-950">
                  {filteredCurrentRentings.length} current rentings found.
                </h3>
                <div className="relative">
                  <select className="appearance-none bg-transparent pr-8 text-sm text-slate-500 outline-none">
                    <option>Sort by: Recent</option>
                  </select>
                  <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-4">
                {filteredCurrentRentings.map((renting, index) => (
                  <CurrentRenting key={`${renting.roomNumber}-${index}`} {...renting} />
                ))}
              </div>
            </section>
          ) : null}

          {!isLoading && activeTab === "archivedRentings" ? (
            <section className="space-y-6">
              <div className="mx-auto w-full max-w-4xl">
                <BookingSearchBar
                  searchValue={archivedRentingSearch}
                  onSearchChange={setArchivedRentingSearch}
                  searchPlaceholder="Search by room number"
                  dateValue={archivedRentingDate}
                  onDateChange={setArchivedRentingDate}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-3xl font-bold tracking-tight text-slate-950">
                  {filteredArchivedRentings.length} archived rentings found.
                </h3>
                <div className="relative">
                  <select className="appearance-none bg-transparent pr-8 text-sm text-slate-500 outline-none">
                    <option>Sort by: Recent</option>
                  </select>
                  <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-4">
                {filteredArchivedRentings.map((renting, index) => (
                  <ArchivedBooking key={`${renting.roomNumber}-${index}`} {...renting} />
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
            onLookupCustomer={handleLookupCustomer}
            onSubmitDirectRent={handleDirectRent}
            onSubmitBookedRent={handleConvertBooking}
            setIsActive={() => setRentTarget(null)}
          />
        </div>
      ) : null}
    </div>
  );
}

export default EmployeeDashboardPage;
