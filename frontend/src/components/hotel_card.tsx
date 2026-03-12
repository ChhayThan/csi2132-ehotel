import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import StarIcon from '@mui/icons-material/Star';

type HotelCardProps = {
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

const HotelCard = ({ href, img, rating, name, chain_name, city, address, starting_cost, available_rooms }: HotelCardProps) => {
  return <Card>
    <CardActionArea
      href={href}
      className="relative"
    >
      <Chip icon={<StarIcon className="text-secondary" />} label={rating.toPrecision(3)} className="absolute right-1 top-1 bg-white" />
      <CardMedia
        component="img"
        image={img}
        title={name}
        className="h-60"
      />
      <CardContent className="grid grid-cols-4">
        <div className="col-span-3">
          <p className="text-sm text-primary">{chain_name}</p>
          <p className="text-lg">{name}</p>
          <p className="text-sm text-muted">{city} - {address}</p>
          <p className="text-xs mt-3">Available rooms: {available_rooms}</p>
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
};

export default HotelCard;
