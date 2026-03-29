import BookingPreviewCard from "../components/booking_preview_card";
import { mockBookings, mockRooms } from "./mock_room_data";

function BookingsPage() {
  const currentBookings = mockBookings.filter((booking) => booking.current);
  const pastBookings = mockBookings.filter((booking) => !booking.current);

  const roomImageById = Object.fromEntries(mockRooms.map((room) => [room.id, room.image]));

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <section className="space-y-6">
          <h1 className="text-4xl font-medium tracking-tight text-slate-950 sm:text-5xl">[name]&apos;s Bookings</h1>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {currentBookings.map((booking) => (
              <BookingPreviewCard
                key={booking.id}
                href={`/bookings/${booking.id}`}
                image={roomImageById[booking.roomId]}
                chainName={booking.chainName}
                hotelName={booking.hotelName}
                stayLabel={booking.stayLabel}
              />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-medium tracking-tight text-slate-950 sm:text-[2.2rem]">Past Reservations</h2>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {pastBookings.map((booking) => (
              <BookingPreviewCard
                key={booking.id}
                href={`/bookings/${booking.id}`}
                image={roomImageById[booking.roomId]}
                chainName={booking.chainName}
                hotelName={booking.hotelName}
                stayLabel={booking.stayLabel}
                actionLabel="View Booking"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default BookingsPage;
