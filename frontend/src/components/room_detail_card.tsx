import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import WavesRoundedIcon from "@mui/icons-material/WavesRounded";
import type { ReactNode } from "react";
import RoomProblemAlert from "./room_problem_alert";

function formatPhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length !== 10) {
    return phoneNumber;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

type RoomDetailCardProps = {
  hotelName: string;
  chainName: string;
  address: string;
  roomName: string;
  roomSubtitle: string;
  viewLabel: string;
  image: string;
  imageAlt?: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  contactEmail: string;
  contactPhone: string;
  problemMessage?: string;
  children?: ReactNode;
};

const RoomDetailCard = ({
  hotelName,
  chainName,
  address,
  roomName,
  roomSubtitle,
  viewLabel,
  image,
  imageAlt,
  rating,
  reviewCount,
  amenities,
  contactEmail,
  contactPhone,
  problemMessage,
  children,
}: RoomDetailCardProps) => {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-7 lg:p-9">
      <div className="flex flex-col gap-6 border-b border-black/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {hotelName}
          </h2>
          <p className="mt-1 text-lg font-semibold uppercase tracking-wide text-primary">
            {chainName}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted">
            <LocationOnOutlinedIcon fontSize="small" />
            <span>{address}</span>
          </div>
        </div>
        <div className="text-left lg:text-right">
          <div className="flex items-center gap-1 lg:justify-end">
            {Array.from({ length: 5 }).map((_, index) => (
              <StarRoundedIcon
                key={index}
                className={index < Math.round(rating) ? "text-secondary" : "text-black/15"}
                fontSize="small"
              />
            ))}
            <span className="ml-1 text-sm text-slate-700">({rating.toFixed(2)})</span>
          </div>
          <p className="mt-1 text-sm text-muted">{reviewCount} reviews</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-black/5 bg-slate-100">
        <img
          src={image}
          alt={imageAlt ?? roomName}
          className="h-64 w-full object-cover sm:h-80 lg:h-[26rem]"
        />
      </div>

      <div className="mt-6 border-t border-black/10 pt-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-950 sm:text-3xl">{roomName}</h3>
            <p className="text-base font-semibold text-slate-700">{roomSubtitle}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <ApartmentRoundedIcon fontSize="small" />
              <span>{viewLabel}</span>
            </div>
          </div>
          {children ? <div className="lg:ml-6">{children}</div> : null}
        </div>

        {problemMessage ? <RoomProblemAlert className="mt-6" message={problemMessage} /> : null}

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section>
            <h4 className="text-lg font-semibold text-slate-950">Amenities</h4>
            <ul className="mt-4 grid list-disc gap-x-8 gap-y-2 pl-5 text-sm text-slate-700 sm:grid-cols-2 xl:grid-cols-3">
              {amenities.map((amenity) => (
                <li key={amenity}>{amenity}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-black/8 bg-slate-50 p-5">
            <h4 className="text-lg font-semibold text-slate-950">Contact Information</h4>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <EmailRoundedIcon fontSize="small" className="mt-0.5 shrink-0 text-primary" />
                <span className="min-w-0 break-all">{contactEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <CallRoundedIcon fontSize="small" className="shrink-0 text-primary" />
                <span>{formatPhoneNumber(contactPhone)}</span>
              </div>
              <div className="flex items-center gap-3">
                <WavesRoundedIcon fontSize="small" className="shrink-0 text-primary" />
                <span>{viewLabel}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
};

export default RoomDetailCard;
