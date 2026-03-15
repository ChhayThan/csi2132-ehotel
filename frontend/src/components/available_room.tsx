type AvailableRoomProps = {
  roomNumber: number;
  roomType: string;
  price: number;
  amenities: string[];
  onManage?: () => void;
};

const AvailableRoom = ({
  roomNumber,
  roomType,
  price,
  amenities,
  onManage,
}: AvailableRoomProps) => {
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
        <div className="mt-5 flex items-end gap-1">
          <span className="text-3xl font-bold text-slate-950">${price}</span>
          <span className="pb-1 text-sm text-slate-400">/night</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onManage}
        className="rounded-lg bg-gradient-to-r from-primary to-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-muted"
      >
        Manage Room
      </button>
    </article>
  );
};

export default AvailableRoom;
