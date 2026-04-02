import { useLocation } from "react-router-dom";
import BookingConfirmed from "../components/booking_confirmed";

function BookingConfirmedPage() {
  const location = useLocation();
  const hotelName = location.state?.hotelName ?? "your selected hotel";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)] px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[65vh] w-full max-w-5xl items-center justify-center">
        <BookingConfirmed hotel_name={hotelName} />
      </div>
    </main>
  );
}

export default BookingConfirmedPage;
