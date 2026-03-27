import { Link } from "react-router-dom";

type HotelRoomListCardProps = {
  href: string;
  image: string;
  roomNumber: number;
  roomType: string;
  view: string;
  amenities: string[];
  price: number;
  extendable?: boolean;
};

const HotelRoomListCard = ({
  href,
  image,
  roomNumber,
  roomType,
  view,
  amenities,
  price,
  extendable = false,
}: HotelRoomListCardProps) => {
  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-black/8 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
      <img src={image} alt={`Room ${roomNumber}`} className="h-44 w-full object-cover sm:h-52" />

      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-bold text-slate-950">
              Room {roomNumber} <span className="font-medium text-slate-700">- {roomType}</span>
            </h3>
            {extendable ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary">
                Extra Bed Available
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-slate-500">{view} View</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span
                key={`${roomNumber}-${amenity}`}
                className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500"
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

        <Link
          to={href}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-primary to-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-muted"
        >
          VIEW ROOM
        </Link>
      </div>
    </article>
  );
};

export default HotelRoomListCard;
