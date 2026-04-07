import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import StarIcon from "@mui/icons-material/Star";

type BrowseHotelCardProps = {
  variant?: "browse";
  href: string;
  img: string;
  rating: number;
  name: string;
  chain_name: string;
  city: string;
  address: string;
  starting_cost: number;
  available_rooms: number;
};

type AdminHotelCardProps = {
  variant: "admin";
  name: string;
  rating: number;
  review_count: number;
  city: string;
  address: string;
  rooms_count: number;
  email: string;
  phone: string;
  onEdit?: () => void;
  onViewEmployees?: () => void;
  onViewRooms?: () => void;
  onDelete?: () => void;
};

type HotelCardProps = BrowseHotelCardProps | AdminHotelCardProps;

const actionButtonClass =
  "cursor-pointer rounded-xl px-5 py-2 text-xs font-bold tracking-wide text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5";

const HotelCard = (props: HotelCardProps) => {
  if (props.variant === "admin") {
    return (
      <article className="relative rounded-2xl border border-black/8 bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
        <button
          type="button"
          onClick={props.onDelete}
          className="absolute right-5 top-3 cursor-pointer text-base text-red-600 transition hover:text-red-700"
          aria-label={`Delete ${props.name}`}
        >
          x
        </button>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-[1.85rem] font-bold leading-none text-slate-950">{props.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-1 text-black">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon key={index} className="text-[16px] text-black" />
                  ))}
                </div>
                <span>{props.rating}</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <LocationOnOutlinedIcon className="text-[18px]" />
                <span>
                  {props.city} - {props.address}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <MeetingRoomRoundedIcon className="text-[16px] text-slate-500" />
                <span>{props.rooms_count} rooms</span>
              </div>
              <div className="flex items-center gap-2">
                <EmailRoundedIcon className="text-[16px] text-slate-500" />
                <span>{props.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <CallRoundedIcon className="text-[16px] text-slate-500" />
                <span>{props.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={props.onEdit} className={`${actionButtonClass} bg-[#565656]`}>
              EDIT HOTEL
            </button>
            <button
              type="button"
              onClick={props.onViewEmployees}
              className={`${actionButtonClass} bg-gradient-to-r from-primary to-blue-900`}
            >
              VIEW EMPLOYEES
            </button>
            <button
              type="button"
              onClick={props.onViewRooms}
              className={`${actionButtonClass} bg-gradient-to-r from-primary to-blue-900`}
            >
              VIEW ROOMS
            </button>
          </div>
        </div>
      </article>
    );
  }

  const { href, img, rating, name, chain_name, city, address, starting_cost, available_rooms } = props;

  return (
    <Card>
      <CardActionArea href={href} className="relative">
        <Chip
          icon={<StarIcon className="text-secondary" />}
          label={rating.toPrecision(3)}
          className="absolute right-1 top-1 bg-white"
        />
        <CardMedia component="img" image={img} title={name} className="h-60" />
        <CardContent className="grid grid-cols-4">
          <div className="col-span-3">
            <p className="text-sm text-primary">{chain_name}</p>
            <p className="text-lg">{name}</p>
            <p className="text-sm text-muted">
              {city} - {address}
            </p>
            <p className="mt-3 text-xs">Available rooms: {available_rooms}</p>
          </div>
          <div>
            <p className="text-sm text-muted">From</p>
            <div className="flex flex-row items-baseline">
              <p className="text-xl">${starting_cost}</p>
              <p className="text-sm text-muted">/night</p>
            </div>
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default HotelCard;
