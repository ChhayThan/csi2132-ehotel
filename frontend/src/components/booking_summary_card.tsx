import { useNavigate } from "react-router-dom";

type BookingSummaryCardProps = {
  room_num: number | string;
  num_nights: number;
  price: number;
  total: number;
  title?: string;
  action_label?: string;
  onAction?: () => void;
  showSubtotal?: boolean;
  className?: string;
  showAction?: boolean;
};

const BookingSummaryCard = ({
  room_num,
  num_nights,
  price,
  total,
  title = "Booking Summary",
  action_label = "CANCEL BOOKING",
  onAction,
  showSubtotal = false,
  className = "",
  showAction = true,
}: BookingSummaryCardProps) => {
  const nav = useNavigate();

  const handleBookingCancel = () => {
    console.log("booking cancelled")
    // cancel booking logic
  }

  return <div className={`bg-white flex flex-col gap-5 px-8 py-6 rounded-xl shadow-lg ${className}`.trim()}>
    <div className="pb-2 border-b border-muted/50">
        <h2 className="font-bold text-lg">{title}</h2>
    </div>
    <div className="flex flex-col gap-2 pb-6 border-b border-muted/50 text-sm">
          <div className="flex justify-between items-center text-black/70">
            <p>Room:</p>
            <p>{room_num}</p>
          </div>
          <div className="flex justify-between items-center text-black/70">
            <p>Nights:</p>
            <p>{num_nights} x Night{num_nights > 1 ? "s" : ""}</p>
          </div>
          <div className="flex justify-between items-center text-black/70">
            <p>Price/Night:</p>
            <p>${Math.round(price*100)/100}</p>
          </div>
          {showSubtotal ? (
            <div className="flex justify-between items-center text-black/70">
              <p>Subtotal:</p>
              <p>${Math.round(price * num_nights * 100) / 100}</p>
            </div>
          ) : null}
        </div>
        <div className="flex justify-between items-center">
            <p>Total:</p>
            <p className="font-bold">${Math.round(total*100)/100}</p>
    </div>

    {showAction ? (
      <button
        onClick={() => (onAction ? onAction() : handleBookingCancel())}
        className="bg-gradient-to-r from-red-700 to-red-900 text-white font-medium py-3 mt-2 rounded-lg text-sm cursor-pointer shadow-md shadow-muted"
      >
        {action_label}
      </button>
    ) : null}
  </div>
};

export default BookingSummaryCard;
