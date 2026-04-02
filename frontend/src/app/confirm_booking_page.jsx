import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import DropDownTab from "../components/drop_down_tab";
import { isUnauthorizedError, useAuth } from "../context/auth_context";
import { createCustomerBooking, getHotelDetails, getRoomDetails } from "../lib/protected_api";
import { fallbackRoomImage, getRoomSubtitle, getRoomType, hasValidStayDates } from "../lib/booking_flow_utils";

const TAX_RATE = 0.13;
const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
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

function calculateNights(checkinDate, checkoutDate) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.max(
    1,
    Math.round((parseDate(checkoutDate).getTime() - parseDate(checkinDate).getTime()) / millisecondsPerDay),
  );
}

function ConfirmBookingPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, token, logout } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openTab, setOpenTab] = useState("summary");
  const checkinDate = searchParams.get("checkin") ?? "";
  const checkoutDate = searchParams.get("checkout") ?? "";
  const guests = Number(searchParams.get("guests") || "2");
  const hotelId = Number(searchParams.get("hotelId"));
  const hasRequiredParams = Boolean(user?.id) && Number.isInteger(hotelId) && Number.isInteger(Number(roomId)) && hasValidStayDates(checkinDate, checkoutDate);

  useEffect(() => {
    const roomNumber = Number(roomId);

    if (!Number.isInteger(hotelId) || !Number.isInteger(roomNumber) || !hasValidStayDates(checkinDate, checkoutDate)) {
      setErrorMessage("A valid check-in and checkout date is required before confirming a booking.");
      setIsLoading(false);
      return;
    }

    let isActive = true;

    async function loadBookingSummary() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [hotelData, roomData] = await Promise.all([
          getHotelDetails(hotelId),
          getRoomDetails(hotelId, roomNumber),
        ]);

        if (!isActive) {
          return;
        }

        setHotel(hotelData);
        setRoom({
          ...roomData,
          image: roomData.image || fallbackRoomImage(),
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage("Unable to load booking summary right now.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadBookingSummary();

    return () => {
      isActive = false;
    };
  }, [hotelId, roomId]);

  const nights = useMemo(() => calculateNights(checkinDate, checkoutDate), [checkinDate, checkoutDate]);
  const subtotal = useMemo(() => Number(room?.price ?? 0) * nights, [nights, room]);
  const taxes = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = subtotal + taxes;

  const handleConfirmBooking = async () => {
    if (!user || !token || !room || !hotel || isSubmitting || !hasRequiredParams) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const bookingId = await createCustomerBooking(
        user.id,
        {
          hid: hotel.hid,
          room_number: room.room_number,
          checkin_date: checkinDate,
          checkout_date: checkoutDate,
        },
        token,
      );

      navigate(`/rooms/${room.room_number}/booking/confirmed`, {
        state: {
          bookingId,
          hotelName: hotel.name,
          roomNumber: room.room_number,
          roomType: getRoomType(room.capacity),
          checkinDate,
          checkoutDate,
          guests,
          total,
        },
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        logout();
        return;
      }

      setErrorMessage(error?.message || "Unable to confirm this booking right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#edf1f7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div>
          <Link
            to={`/rooms/${roomId}?hotelId=${hotelId}&checkin=${checkinDate}&checkout=${checkoutDate}&guests=${guests}`}
            className="inline-flex cursor-pointer items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800"
          >
            <ChevronLeftRoundedIcon fontSize="small" />
            <span>back to room</span>
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Confirm Booking</h1>
        </div>

        {isLoading ? <p className="text-sm text-slate-500">Loading booking summary...</p> : null}
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        {!hasRequiredParams ? (
          <div className="rounded-3xl border border-black/8 bg-white p-8 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
            <h1 className="text-3xl font-bold text-slate-950">Missing booking details</h1>
            <p className="mt-3 text-sm text-slate-600">
              We need a hotel, room, check-in date, and checkout date before a booking can be created.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-primary to-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-muted"
            >
              GO TO MAIN PAGE
            </Link>
          </div>
        ) : null}

        {hasRequiredParams ? (
        <div className="flex flex-col gap-4">
          <DropDownTab
            title="1. Sign In"
            isOpen={false}
            isCompleted
            onToggle={undefined}
          >
            {null}
          </DropDownTab>

          <DropDownTab
            title="2. Booking Summary"
            isOpen={openTab === "summary"}
            onToggle={() => setOpenTab("summary")}
            isDisabled={false}
          >
            {!isLoading && hotel && room ? (
              <div className="border-t border-black/8 pt-6">
                <section className="rounded-2xl border border-black/8 bg-white p-5">
                  <h3 className="text-2xl font-bold text-slate-950">Room details</h3>

                  <div className="mt-5 grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
                    <div>
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                          <HotelRoundedIcon />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-950">{hotel.name}</p>
                          <p className="text-sm text-slate-600">Room {room.room_number}</p>
                          <p className="text-sm text-slate-500">{getRoomSubtitle(room.capacity)}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                        <LocationOnOutlinedIcon fontSize="small" />
                        <span>
                          {hotel.address.city} - {hotel.address.street_address}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-700">
                      <h4 className="border-b border-black/8 pb-2 text-lg font-semibold text-slate-950">
                        Order summary
                      </h4>
                      <div className="flex items-center justify-between">
                        <span>Room</span>
                        <span>
                          {room.room_number} ({getRoomType(room.capacity)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Nights</span>
                        <span>{nights} x Nights</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Price/Night</span>
                        <span>${Number(room.price).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Taxes</span>
                        <span>${taxes.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-black/8 pt-3">
                        <div className="flex items-center justify-between text-lg font-bold text-slate-950">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
                    <section>
                      <h3 className="text-2xl font-bold text-slate-950">Booking details</h3>
                      <div className="mt-4 space-y-2 text-sm text-slate-700">
                        <p>
                          <strong>Check in:</strong> {formatDate(checkinDate)}
                        </p>
                        <p>
                          <strong>Checkout:</strong> {formatDate(checkoutDate)}
                        </p>
                        <p>
                          <strong>Guests:</strong> {guests} guests
                        </p>
                      </div>
                    </section>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting}
                    className="mt-8 cursor-pointer rounded-lg bg-gradient-to-r from-primary to-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-muted"
                  >
                    {isSubmitting ? "CONFIRMING..." : "CONFIRM BOOKING"}
                  </button>
                </section>
              </div>
            ) : null}
          </DropDownTab>
        </div>
        ) : null}
      </div>
    </main>
  );
}

export default ConfirmBookingPage;
