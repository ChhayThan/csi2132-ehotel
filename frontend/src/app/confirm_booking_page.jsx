import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DropDownTab from "../components/drop_down_tab";
import { mockBooking, mockHotel, mockRooms } from "./mock_room_data";

function ConfirmBookingPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const room = useMemo(() => mockRooms.find((item) => item.id === roomId) ?? mockRooms[0], [roomId]);
  const [isSignedIn] = useState(true);
  const [openTab, setOpenTab] = useState(isSignedIn ? "summary" : "signin");

  const subtotal = room.price * mockBooking.nights;
  const total = subtotal + mockBooking.taxes;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#edf1f7_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div>
          <Link
            to={`/rooms/${room.id}`}
            className="inline-flex cursor-pointer items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800"
          >
            <ChevronLeftRoundedIcon fontSize="small" />
            <span>back to room</span>
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Confirm Booking</h1>
        </div>

        <div className="flex flex-col gap-4">
          <DropDownTab
            title="1. Sign In"
            isOpen={!isSignedIn && openTab === "signin"}
            isCompleted={isSignedIn}
            onToggle={!isSignedIn ? () => setOpenTab("signin") : undefined}
          >
            {!isSignedIn ? (
              <div className="border-t border-black/8 pt-5">
                <p className="max-w-2xl text-sm text-slate-600">
                  You must sign in to book a room. Please continue to{" "}
                  <Link to="/login" className="text-primary font-semibold underline">
                    sign in
                  </Link>
                  .
                </p>
              </div>
            ) : null}
          </DropDownTab>

          <DropDownTab
            title="2. Booking Summary"
            isOpen={isSignedIn && openTab === "summary"}
            onToggle={isSignedIn ? () => setOpenTab("summary") : undefined}
            isDisabled={!isSignedIn}
          >
            {isSignedIn ? (
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
                          <p className="text-lg font-bold text-slate-950">{mockHotel.name}</p>
                          <p className="text-sm text-slate-600">Room {room.roomNumber}</p>
                          <p className="text-sm text-slate-500">{room.subtitle}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                        <LocationOnOutlinedIcon fontSize="small" />
                        <span>
                          {mockHotel.city} - {mockHotel.address}
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
                          {room.roomNumber} ({room.roomType})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Nights</span>
                        <span>{mockBooking.nights} x Nights</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Price/Night</span>
                        <span>${room.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Taxes</span>
                        <span>${mockBooking.taxes.toFixed(2)}</span>
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
                          <strong>Check in:</strong> {mockBooking.checkinDate}
                        </p>
                        <p>
                          <strong>Checkout:</strong> {mockBooking.checkoutDate}
                        </p>
                        <p>
                          <strong>Guests:</strong> {mockBooking.guests} guests
                        </p>
                      </div>
                    </section>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/rooms/${room.id}/booking/confirmed`)}
                    className="mt-8 cursor-pointer rounded-lg bg-gradient-to-r from-primary to-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-muted"
                  >
                    CONFIRM BOOKING
                  </button>
                </section>
              </div>
            ) : null}
          </DropDownTab>
        </div>
      </div>
    </main>
  );
}

export default ConfirmBookingPage;
