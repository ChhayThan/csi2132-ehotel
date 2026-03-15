import { Link, useNavigate } from 'react-router-dom' 
import Checkmark from "@mui/icons-material/EventAvailable";

type BookingConfirmedProps = {
  hotel_name: string;
};

const BookingConfirmed = ({ hotel_name }: BookingConfirmedProps) => {
  const nav = useNavigate();

  return (
    <div className="flex flex-col items-center text-center gap-4 w-full">
      <div className="flex items-center text-primary">
        <h1 className="text-3xl md:text-5xl font-bold">Booking Confirmed</h1>
        <Checkmark className="text-4xl md:text-6xl text-primary mt-2 mx-4"/>
      </div>
      <p>Your stay at {hotel_name} has been confirmed. You can modify your booking under <Link to="/bookings" className="text-primary font-semibold underline">Bookings</Link> in your account.</p>
      <p className="font-semibold">Thank you for booking with us!</p>
      <button onClick={() => nav("/")} className="bg-gradient-to-r from-primary to-blue-900 text-white py-3 rounded-lg mt-3 text-sm font-semibold cursor-pointer shadow-md shadow-muted w-30"> HOME </button>
    </div>
  );
};

export default BookingConfirmed;
