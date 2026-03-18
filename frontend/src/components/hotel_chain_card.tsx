import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

type HotelChainCardProps = {
  name: string;
  city: string;
  address: string;
  hotels_count: number;
  email: string;
  phone: string;
  onEdit?: () => void;
  onViewHotels?: () => void;
  onDelete?: () => void;
};

const buttonClass =
  "cursor-pointer rounded-xl px-5 py-2 text-xs font-bold tracking-wide text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5";

const HotelChainCard = ({
  name,
  city,
  address,
  hotels_count,
  email,
  phone,
  onEdit,
  onViewHotels,
  onDelete,
}: HotelChainCardProps) => {
  return (
    <article className="relative rounded-2xl border border-black/8 bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-5 top-3 cursor-pointer text-base text-red-600 transition hover:text-red-700"
        aria-label={`Delete ${name}`}
      >
        x
      </button>

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div>
            <h3 className="text-[1.85rem] font-bold leading-none text-slate-950">{name}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <LocationOnOutlinedIcon className="text-[18px]" />
              <span>
                {city} - {address}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <BusinessRoundedIcon className="text-[16px] text-slate-500" />
              <span>{hotels_count} hotels</span>
            </div>
            <div className="flex items-center gap-2">
              <EmailRoundedIcon className="text-[16px] text-slate-500" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <CallRoundedIcon className="text-[16px] text-slate-500" />
              <span>{phone}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onEdit} className={`${buttonClass} bg-[#565656]`}>
            EDIT CHAIN
          </button>
          <button
            type="button"
            onClick={onViewHotels}
            className={`${buttonClass} bg-gradient-to-r from-primary to-blue-900`}
          >
            VIEW HOTELS
          </button>
        </div>
      </div>
    </article>
  );
};

export default HotelChainCard;
