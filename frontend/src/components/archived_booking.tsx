type ArchivedBookingProps = {
  roomNumber: number;
  roomType: string;
  customerId: string;
  bookedDate: string;
  stayDates: string;
  total: number;
};

const ArchivedBooking = ({
  roomNumber,
  roomType,
  customerId,
  bookedDate,
  stayDates,
  total,
}: ArchivedBookingProps) => {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-black/8 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h3 className="text-2xl font-semibold text-slate-950">
          Room {roomNumber} <span className="font-normal text-slate-700">- {roomType}</span>
        </h3>
        <div className="mt-4 space-y-1 text-sm text-slate-500">
          <p>
            Customer ID: <span className="font-medium text-slate-700">{customerId}</span>
          </p>
          <p>
            Date booked: <span className="font-medium text-slate-700">{bookedDate}</span>
          </p>
          <p>
            Stay dates: <span className="font-medium text-slate-700">{stayDates}</span>
          </p>
        </div>
      </div>

      <div className="text-left lg:text-right">
        <p className="text-sm text-slate-500">Total</p>
        <p className="mt-1 text-2xl font-bold text-slate-950">${total.toFixed(2)}</p>
      </div>
    </article>
  );
};

export default ArchivedBooking;
