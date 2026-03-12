import Card from "@mui/material/Card";
import { Amenity, RoomType, View } from "../types/enums";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import WavesIcon from '@mui/icons-material/Waves';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LandscapeIcon from '@mui/icons-material/Landscape';
import Button from "@mui/material/Button";

type RoomCardProps = {
  href: string;
  img: string;
  room_number: number;
  room_type: RoomType;
  price: number;
  view: View;
  amenities: Amenity[];
};

const RoomCard = ({ href, img, room_number, room_type, price, view, amenities }: RoomCardProps) => {
  return <Card>
    <CardMedia
      component="img"
      image={img}
      title={`Room ${room_number}`}
      className="h-50"
    />
    <CardContent>
      <p className="text-lg"><b>Room {room_number}</b> - {room_type}</p>
      <div className="flex flex-row items-center gap-2 mt-2">
        {view === "Ocean" ? <WavesIcon /> : (view === "City" ? <ApartmentIcon /> : <LandscapeIcon />)}
        <p className="mr-3">{view} View</p>
        {amenities.map((amenity) => <Chip label={amenity} />)}
      </div>
      <div className="flex justify-between mt-6">
        <div className="flex items-baseline">
          <p className="text-xl"><b>${price}</b></p>
          <p className="text-muted text-xs">/night</p>
        </div>
        <Button
          variant="contained"
          color="primary"
          size="small"
          href={href}
          className="drop-shadow-sm"
        >
          View Room
        </Button>
      </div>
    </CardContent>
  </Card>
}

export default RoomCard;
