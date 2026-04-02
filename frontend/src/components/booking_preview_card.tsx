import { Link } from "react-router-dom";

type BookingPreviewCardProps = {
  href: string;
  image: string;
  chainName: string;
  hotelName: string;
  stayLabel: string;
  actionLabel?: string;
  state?: unknown;
};

const BookingPreviewCard = ({
  href,
  image,
  chainName,
  hotelName,
  stayLabel,
  actionLabel = "View Booking",
  state,
}: BookingPreviewCardProps) => {
  return (
    <article className="overflow-hidden rounded-lg border border-black/8 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.06)]">
      <img src={image} alt={hotelName} className="h-40 w-full object-cover" />
      <div className="grid gap-3 p-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">{chainName}</p>
          <p className="mt-1 text-base font-bold text-slate-950">{hotelName}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">{stayLabel}</p>
        </div>

        <Link
          to={href}
          state={state}
          className="inline-flex cursor-pointer items-center justify-center rounded-md bg-gradient-to-r from-primary to-blue-900 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-muted"
        >
          {actionLabel}
        </Link>
      </div>
    </article>
  );
};

export default BookingPreviewCard;
