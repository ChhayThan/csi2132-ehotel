import { Link, useParams } from "react-router-dom";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import BookingSummaryCard from "../components/booking_summary_card";
import RoomProblemAlert from "../components/room_problem_alert";
import { mockBooking, mockBookings, mockHotel, mockRooms } from "./mock_room_data";

function ViewBookingPage() {
  const { bookingId } = useParams();
  const booking = mockBookings.find((item) => item.id === bookingId) ?? mockBookings[0];
  const room = mockRooms.find((item) => item.id === booking.roomId) ?? mockRooms[0];
  const total = room.price * mockBooking.nights + mockBooking.taxes;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Link to="/bookings" className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <span>&lt;</span>
          <span>back to bookings</span>
        </Link>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
          <article className="overflow-hidden rounded-[1.6rem] border border-black/8 bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)] sm:p-7">
            <div className="flex flex-col gap-6 border-b border-black/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-950">{booking.hotelName}</h1>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    {booking.status}
                  </span>
                </div>
                <p className="mt-1 text-lg font-semibold uppercase tracking-wide text-primary">{booking.chainName}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <LocationOnOutlinedIcon fontSize="small" />
                  <span>
                    {booking.city} - {booking.address}
                  </span>
                </div>
              </div>

              <div className="text-left lg:text-right">
                <div className="flex items-center gap-1 lg:justify-end">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarRoundedIcon key={index} className="text-[16px] text-black" />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-b border-black/10 py-4 text-xs text-slate-500 sm:grid-cols-3">
              <p>
                Booking date: <span className="font-medium text-slate-700">{booking.bookedDate}</span>
              </p>
              <p>
                Stay: <span className="font-medium text-slate-700">{booking.stayLabel}</span>
              </p>
              <p>
                Confirmation#: <span className="font-medium text-slate-700">{booking.confirmationNumber}</span>
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-black/6 bg-slate-100">
              <img src={room.image} alt={`Room ${room.roomNumber}`} className="h-72 w-full object-cover sm:h-96" />
            </div>

            <div className="mt-6 border-t border-black/10 pt-5">
              <h2 className="text-3xl font-bold text-slate-950">Room {room.roomNumber}</h2>
              <p className="text-sm font-semibold text-slate-700">{room.subtitle}</p>
              <p className="mt-1 text-sm text-slate-500">{room.view} View</p>

              {room.problemMessage ? <RoomProblemAlert className="mt-5" message={room.problemMessage} /> : null}

              <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
                <section>
                  <h3 className="text-lg font-semibold text-slate-950">Amenities</h3>
                  <ul className="mt-4 grid list-disc gap-x-8 gap-y-2 pl-5 text-sm text-slate-700 sm:grid-cols-2 xl:grid-cols-3">
                    {room.detailAmenities.map((amenity) => (
                      <li key={amenity}>{amenity}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-950">Contact Information</h3>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p>{mockHotel.contactEmail}</p>
                    <p>{mockHotel.contactPhone}</p>
                  </div>
                </section>
              </div>
            </div>
          </article>

          <div className="xl:sticky xl:top-28">
            <BookingSummaryCard
              room_num={`${room.roomNumber} (${room.roomType})`}
              num_nights={mockBooking.nights}
              price={room.price}
              total={total}
              showSubtotal
              showAction={booking.current}
              onAction={() => console.log("mock cancel booking", booking.id)}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default ViewBookingPage;
