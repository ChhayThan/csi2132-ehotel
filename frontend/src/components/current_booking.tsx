type CurrentBookingProps = {
  roomNumber: number;
  roomType: string;
  amenities: string[];
  guestName: string;
  guestEmail: string;
  bookedDate: string;
  stayDates: string;
  onRent?: () => void;
};

const CurrentBooking = ({
  roomNumber,
  roomType,
  amenities,
  guestName,
  guestEmail,
  bookedDate,
  stayDates,
  onRent,
}: CurrentBookingProps) => {
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-black/8 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h3 className="text-2xl font-semibold text-slate-950">
          Room {roomNumber} <span className="font-normal text-slate-700">- {roomType}</span>
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500"
            >
              {amenity}
            </span>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-sm text-slate-500">
          <p>
            Guest: <span className="font-medium text-slate-700">{guestName}</span> ({guestEmail})
          </p>
          <p>
            Date booked: <span className="font-medium text-slate-700">{bookedDate}</span>
          </p>
          <p>
            Stay dates: <span className="font-medium text-slate-700">{stayDates}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRent}
        className="rounded-lg bg-gradient-to-r from-primary to-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-muted"
      >
        Rent Room
      </button>
    </article>
  );
};

export default CurrentBooking;
