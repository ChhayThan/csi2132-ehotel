import { useNavigate } from "react-router-dom";

type BookingInformationCardProps = {
  checkin_date: string;
  checkout_date: string;
  num_guests: number;
  estimated_total: number;
  continue_href?: string;
};

const BookingInformationCard = ({
  checkin_date,
  checkout_date,
  num_guests,
  estimated_total,
  continue_href,
}: BookingInformationCardProps) => {
  const nav = useNavigate();

  return <div className="bg-white flex flex-col gap-5 px-8 py-6 rounded-xl shadow-lg">
    <div className="pb-2 border-b border-muted/50">
        <h2 className="font-bold text-lg">Booking Information</h2>
    </div>
    <div className="flex flex-col gap-5 pb-6 border-b border-muted/50 text-sm">
        <div className="text-black/50">
            <p><strong>Check in:</strong> {checkin_date}</p>
            <p><strong>Checkout:</strong> {checkout_date}</p>
            <p><strong>Guests:</strong> {num_guests} guest{num_guests > 1 ? "s" : ""}</p>
        </div>
        <div className="flex justify-between items-center">
            <p>Estimated total:</p>
            <p className="font-bold">${Math.round(estimated_total*100)/100}</p>
        </div>
    </div>

    <button onClick={(() => nav(continue_href ?? "/bookings"))} className="bg-gradient-to-r from-primary to-blue-900 text-white font-medium py-3 mt-2 rounded-lg text-sm cursor-pointer shadow-md shadow-muted"> CONTINUE TO BOOKING </button>
  </div>
};

export default BookingInformationCard;
