import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import BookingInformationCard from "../components/booking_information_card";
import RoomDetailCard from "../components/room_detail_card";
import { getHotelDetails, getRoomDetails } from "../lib/protected_api";
import { fallbackRoomImage, getRoomSubtitle, hasValidStayDates } from "../lib/booking_flow_utils";

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

function calculateNights(checkinDate, checkoutDate) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.max(
    1,
    Math.round((parseDate(checkoutDate).getTime() - parseDate(checkinDate).getTime()) / millisecondsPerDay),
  );
}

function ViewRoomPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const hotelId = Number(searchParams.get("hotelId"));
  const checkinDate = searchParams.get("checkin") ?? "";
  const checkoutDate = searchParams.get("checkout") ?? "";
  const guests = Number(searchParams.get("guests") || "2");
  const hasRequiredParams = Number.isInteger(hotelId) && Number.isInteger(Number(roomId)) && hasValidStayDates(checkinDate, checkoutDate);

  useEffect(() => {
    const roomNumber = Number(roomId);

    if (!Number.isInteger(hotelId) || !Number.isInteger(roomNumber) || !hasValidStayDates(checkinDate, checkoutDate)) {
      setErrorMessage("A valid check-in and checkout date is required to view room details.");
      setIsLoading(false);
      return;
    }

    let isActive = true;

    async function loadRoomPage() {
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
          amenities: roomData.amenities ?? [],
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage("Unable to load room details right now.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadRoomPage();

    return () => {
      isActive = false;
    };
  }, [hotelId, roomId]);

  const estimatedTotal = useMemo(() => {
    if (!room) {
      return 0;
    }

    return Number(room.price) * calculateNights(checkinDate, checkoutDate);
  }, [checkinDate, checkoutDate, room]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Link
          to={`/hotels/${hotelId}/rooms?checkin=${checkinDate}&checkout=${checkoutDate}&guests=${guests}`}
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <span>&lt;</span>
          <span>back to rooms</span>
        </Link>

        {isLoading ? <p className="text-sm text-slate-500">Loading room details...</p> : null}
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        {!hasRequiredParams ? (
          <div className="rounded-3xl border border-black/8 bg-white p-8 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
            <h1 className="text-3xl font-bold text-slate-950">Missing booking details</h1>
            <p className="mt-3 text-sm text-slate-600">
              Choose a valid check-in and checkout date from the main page before viewing room details.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-primary to-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-muted"
            >
              GO TO MAIN PAGE
            </Link>
          </div>
        ) : null}

        {hotel && room && hasRequiredParams ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
          <RoomDetailCard
            hotelName={hotel.name}
            chainName={hotel.chain_name}
            address={`${hotel.address.city} - ${hotel.address.street_address}`}
            roomName={`Room ${room.room_number}`}
            roomSubtitle={getRoomSubtitle(room.capacity)}
            viewLabel={`${room.view} View`}
            image={room.image}
            rating={Number(hotel.rating ?? 0)}
            reviewCount={0}
            amenities={room.amenities}
            contactEmail={hotel.email_addresses?.[0] ?? "No hotel email available"}
            contactPhone={hotel.phone_number}
            problemMessage={room.problem || undefined}
          />

          <div className="xl:sticky xl:top-28">
            <BookingInformationCard
              checkin_date={formatDate(checkinDate)}
              checkout_date={formatDate(checkoutDate)}
              num_guests={guests}
              estimated_total={estimatedTotal}
              continue_href={`/rooms/${room.room_number}/booking?hotelId=${hotelId}&checkin=${checkinDate}&checkout=${checkoutDate}&guests=${guests}`}
            />
          </div>
        </section>
        ) : null}
      </div>
    </main>
  );
}

export default ViewRoomPage;
