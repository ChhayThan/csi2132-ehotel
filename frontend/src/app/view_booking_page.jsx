import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import BookingSummaryCard from "../components/booking_summary_card";
import RoomProblemAlert from "../components/room_problem_alert";
import { isUnauthorizedError, useAuth } from "../context/auth_context";
import {
  cancelCustomerBooking,
  getCustomerBookingDetails,
  getCustomerBookings,
  getHotelDetails,
  getRoomDetails,
} from "../lib/protected_api";
import { fallbackRoomImage, getRoomSubtitle, getRoomType } from "../lib/booking_flow_utils";

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function parseDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function formatDate(dateString) {
  return fullDateFormatter.format(parseDate(dateString));
}

function formatStayLabel(checkinDate, checkoutDate) {
  return `${formatDate(checkinDate)} - ${formatDate(checkoutDate)}`;
}

function calculateNights(checkinDate, checkoutDate) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.max(
    1,
    Math.round((parseDate(checkoutDate).getTime() - parseDate(checkinDate).getTime()) / millisecondsPerDay),
  );
}

function hasFullBookingDetail(detail) {
  return Boolean(
    detail &&
      detail.hotel &&
      detail.room &&
      Array.isArray(detail.amenities),
  );
}

async function buildBookingDetail(rawBooking, isArchived) {
  const [hotel, room] = await Promise.all([
    getHotelDetails(rawBooking.hid),
    getRoomDetails(rawBooking.hid, rawBooking.room_number),
  ]);

  return {
    rawBooking,
    isArchived,
    hotel,
    room,
    hotelName: hotel.name,
    chainName: hotel.chain_name,
    roomNumber: room.room_number,
    roomType: getRoomType(room.capacity),
    roomSubtitle: getRoomSubtitle(room.capacity),
    roomImage: room.image || fallbackRoomImage(),
    address: `${hotel.address.city} - ${hotel.address.street_address}`,
    bookedDate: formatDate(rawBooking.creation_date),
    stayLabel: formatStayLabel(rawBooking.checkin_date, rawBooking.checkout_date),
    confirmationNumber: `BK-${rawBooking.ref_id}`,
    status: isArchived ? "Completed" : "Confirmed",
    nights: calculateNights(rawBooking.checkin_date, rawBooking.checkout_date),
    total: Number(room.price) * calculateNights(rawBooking.checkin_date, rawBooking.checkout_date),
    problemMessage: room.problem || "",
    amenities: room.amenities ?? [],
  };
}

function ViewBookingPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [bookingData, setBookingData] = useState(location.state?.bookingData ?? null);
  const [isLoading, setIsLoading] = useState(!hasFullBookingDetail(location.state?.bookingData));
  const [errorMessage, setErrorMessage] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!user || !token || hasFullBookingDetail(bookingData)) {
      return;
    }

    let isActive = true;

    async function loadBooking() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const numericBookingId = Number(bookingId);
        let rawBooking;
        let isArchived = false;

        try {
          rawBooking = await getCustomerBookingDetails(user.id, numericBookingId, token);
        } catch (error) {
          if (isUnauthorizedError(error)) {
            throw error;
          }

          const archivedRows = await getCustomerBookings(user.id, true, token);
          rawBooking = archivedRows.find((item) => String(item.ref_id) === String(bookingId));
          isArchived = true;

          if (!rawBooking) {
            throw error;
          }
        }

        const detail = await buildBookingDetail(rawBooking, isArchived);

        if (!isActive) {
          return;
        }

        setBookingData(detail);
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (isUnauthorizedError(error)) {
          logout();
          return;
        }

        setErrorMessage("Unable to load booking details right now.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadBooking();

    return () => {
      isActive = false;
    };
  }, [bookingId, bookingData, logout, token, user]);

  const ratingValue = useMemo(() => {
    if (!bookingData) {
      return 0;
    }

    return Number(bookingData.hotel.rating ?? 0);
  }, [bookingData]);

  const reviewCount = useMemo(() => {
    return 0;
  }, [bookingData]);

  const amenities = bookingData?.amenities ?? [];
  const roomView = bookingData?.room?.view ?? "Ocean";
  const hotelEmail = bookingData?.hotel?.email_addresses?.[0] ?? "No hotel email available";
  const hotelPhone = bookingData?.hotel?.phone_number ?? "No hotel phone available";
  const roomPrice = bookingData?.room?.price ?? 0;

  const handleCancelBooking = async () => {
    if (!user || !token || !bookingData || bookingData.isArchived || isCancelling) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancelCustomerBooking(user.id, bookingData.rawBooking.ref_id, token);
      navigate("/bookings");
    } catch (error) {
      if (isUnauthorizedError(error)) {
        logout();
        return;
      }

      setErrorMessage("Unable to cancel this booking right now.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Link to="/bookings" className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <span>&lt;</span>
          <span>back to bookings</span>
        </Link>

        {isLoading ? <p className="text-sm text-slate-500">Loading booking details...</p> : null}
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        {!isLoading && bookingData ? (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
            <article className="overflow-hidden rounded-[1.6rem] border border-black/8 bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)] sm:p-7">
              <div className="flex flex-col gap-6 border-b border-black/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-950">{bookingData.hotelName}</h1>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      {bookingData.status}
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-semibold uppercase tracking-wide text-primary">{bookingData.chainName}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <LocationOnOutlinedIcon fontSize="small" />
                    <span>{bookingData.address}</span>
                  </div>
                </div>

                <div className="text-left lg:text-right">
                  <div className="flex items-center gap-1 lg:justify-end">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarRoundedIcon key={index} className="text-[16px] text-black" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {ratingValue.toFixed ? ratingValue.toFixed(2) : ratingValue}
                    {reviewCount ? ` (${reviewCount} reviews)` : ""}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 border-b border-black/10 py-4 text-xs text-slate-500 sm:grid-cols-3">
                <p>
                  Booking date: <span className="font-medium text-slate-700">{bookingData.bookedDate}</span>
                </p>
                <p>
                  Stay: <span className="font-medium text-slate-700">{bookingData.stayLabel}</span>
                </p>
                <p>
                  Confirmation#: <span className="font-medium text-slate-700">{bookingData.confirmationNumber}</span>
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-black/6 bg-slate-100">
                <img src={bookingData.roomImage} alt={`Room ${bookingData.roomNumber}`} className="h-72 w-full object-cover sm:h-96" />
              </div>

              <div className="mt-6 border-t border-black/10 pt-5">
                <h2 className="text-3xl font-bold text-slate-950">Room {bookingData.roomNumber}</h2>
                <p className="text-sm font-semibold text-slate-700">{bookingData.roomSubtitle}</p>
                <p className="mt-1 text-sm text-slate-500">{roomView} View</p>

                {bookingData.problemMessage ? <RoomProblemAlert className="mt-5" message={bookingData.problemMessage} /> : null}

                <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
                  <section>
                    <h3 className="text-lg font-semibold text-slate-950">Amenities</h3>
                    <ul className="mt-4 grid list-disc gap-x-8 gap-y-2 pl-5 text-sm text-slate-700 sm:grid-cols-2 xl:grid-cols-3">
                      {amenities.map((amenity) => (
                        <li key={amenity}>{amenity}</li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-slate-950">Contact Information</h3>
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <p>{hotelEmail}</p>
                      <p>{hotelPhone}</p>
                    </div>
                  </section>
                </div>
              </div>
            </article>

            <div className="xl:sticky xl:top-28">
              <BookingSummaryCard
                room_num={`${bookingData.roomNumber} (${bookingData.roomType})`}
                num_nights={bookingData.nights}
                price={roomPrice}
                total={bookingData.total}
                showSubtotal
                showAction={!bookingData.isArchived && !isCancelling}
                onAction={handleCancelBooking}
              />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default ViewBookingPage;
