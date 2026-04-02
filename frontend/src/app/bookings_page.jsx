import { useEffect, useMemo, useState } from "react";
import BookingPreviewCard from "../components/booking_preview_card";
import { useAuth, isUnauthorizedError } from "../context/auth_context";
import {
  getCustomerBookings,
  getHotelDetails,
  getRoomDetails,
} from "../lib/protected_api";
import { fallbackRoomImage } from "../lib/booking_flow_utils";

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function parseDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function formatStayLabel(checkinDate, checkoutDate) {
  const checkin = parseDate(checkinDate);
  const checkout = parseDate(checkoutDate);

  return `${shortDateFormatter.format(checkin)} - ${shortDateFormatter.format(checkout)}`;
}

async function enrichBooking(booking) {
  const [hotel, room] = await Promise.all([
    getHotelDetails(booking.hid),
    getRoomDetails(booking.hid, booking.room_number),
  ]);

  return {
    id: String(booking.ref_id),
    hotelId: booking.hid,
    roomNumber: booking.room_number,
    hotelName: hotel.name,
    chainName: hotel.chain_name,
    stayLabel: formatStayLabel(booking.checkin_date, booking.checkout_date),
    image: room.image || fallbackRoomImage(),
    booking,
    hotel,
    room,
  };
}

function BookingsPage() {
  const { user, token, displayName, logout } = useAuth();
  const [currentBookings, setCurrentBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    let isActive = true;

    async function loadBookings() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [currentRows, archivedRows] = await Promise.all([
          getCustomerBookings(user.id, false, token),
          getCustomerBookings(user.id, true, token),
        ]);

        const [currentData, archivedData] = await Promise.all([
          Promise.all(currentRows.map(enrichBooking)),
          Promise.all(archivedRows.map(enrichBooking)),
        ]);

        if (!isActive) {
          return;
        }

        setCurrentBookings(currentData);
        setPastBookings(archivedData);
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (isUnauthorizedError(error)) {
          logout();
          return;
        }

        setErrorMessage("Unable to load bookings right now.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      isActive = false;
    };
  }, [user, token, logout]);

  const heading = useMemo(() => {
    return displayName ? `${displayName}'s Bookings` : "My Bookings";
  }, [displayName]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <section className="space-y-6">
          <h1 className="text-4xl font-medium tracking-tight text-slate-950 sm:text-5xl">{heading}</h1>

          {isLoading ? <p className="text-sm text-slate-500">Loading your bookings...</p> : null}
          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

          {!isLoading && !errorMessage ? (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {currentBookings.length > 0 ? (
                currentBookings.map((booking) => (
                  <BookingPreviewCard
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    image={booking.image}
                    chainName={booking.chainName}
                    hotelName={booking.hotelName}
                    stayLabel={booking.stayLabel}
                    state={{ bookingData: booking }}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-500">No current bookings found.</p>
              )}
            </div>
          ) : null}
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-medium tracking-tight text-slate-950 sm:text-[2.2rem]">Past Reservations</h2>

          {!isLoading && !errorMessage ? (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <BookingPreviewCard
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    image={booking.image}
                    chainName={booking.chainName}
                    hotelName={booking.hotelName}
                    stayLabel={booking.stayLabel}
                    actionLabel="View Booking"
                    state={{ bookingData: booking }}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-500">No past reservations found.</p>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default BookingsPage;
