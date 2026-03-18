import Card from "@mui/material/Card";
import { Amenity, RoomType, View } from "../types/enums";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import WavesIcon from "@mui/icons-material/Waves";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LandscapeIcon from "@mui/icons-material/Landscape";
import Button from "@mui/material/Button";

type BrowseRoomCardProps = {
  variant?: "browse";
  href: string;
  img: string;
  room_number: number;
  room_type: RoomType;
  price: number;
  view: View;
  amenities: Amenity[];
};

type AdminRoomCardProps = {
  variant: "admin";
  room_number: number;
  price: number;
  room_type?: string;
  view?: string;
  amenities?: string[];
  problems?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

type RoomCardProps = BrowseRoomCardProps | AdminRoomCardProps;

const RoomCard = (props: RoomCardProps) => {
  if (props.variant === "admin") {
    return (
      <article className="relative rounded-2xl border border-black/8 bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
        <button
          type="button"
          onClick={props.onDelete}
          className="absolute right-5 top-3 cursor-pointer text-base text-red-600 transition hover:text-red-700"
          aria-label={`Delete room ${props.room_number}`}
        >
          x
        </button>

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-[1.85rem] font-bold leading-none text-slate-950">Room {props.room_number}</h3>
            <p className="mt-1 text-lg font-medium text-slate-500">${props.price} per night</p>
            {props.room_type || props.view || props.amenities?.length ? (
              <p className="mt-2 text-sm text-slate-500">
                {[props.room_type, props.view, props.amenities?.slice(0, 3).join(", ")].filter(Boolean).join(" • ")}
              </p>
            ) : null}
            {props.problems ? <p className="mt-1 text-sm text-red-600">{props.problems}</p> : null}
          </div>

          <button
            type="button"
            onClick={props.onEdit}
            className="cursor-pointer self-start rounded-xl bg-[#565656] px-5 py-2 text-xs font-bold tracking-wide text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 md:self-auto"
          >
            EDIT ROOM
          </button>
        </div>
      </article>
    );
  }

  const { href, img, room_number, room_type, price, view, amenities } = props;

  return (
    <Card>
      <CardMedia component="img" image={img} title={`Room ${room_number}`} className="h-50" />
      <CardContent>
        <p className="text-lg">
          <b>Room {room_number}</b> - {room_type}
        </p>
        <div className="mt-2 flex flex-row items-center gap-2">
          {view === "Ocean" ? <WavesIcon /> : view === "City" ? <ApartmentIcon /> : <LandscapeIcon />}
          <p className="mr-3">{view} View</p>
          {amenities.map((amenity) => (
            <Chip key={`${room_number}-${amenity}`} label={amenity} />
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <div className="flex items-baseline">
            <p className="text-xl">
              <b>${price}</b>
            </p>
            <p className="text-muted text-xs">/night</p>
          </div>
          <Button variant="contained" color="primary" size="small" href={href} className="drop-shadow-sm">
            View Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
