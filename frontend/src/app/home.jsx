import { useState, useEffect, useRef } from 'react';

import SearchIcon from "@mui/icons-material/SearchOutlined";
import CalendarIcon from "@mui/icons-material/CalendarMonth";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import FilterIcon from "@mui/icons-material/FilterAltOutlined";

import heroBg from '../assets/hero_bg.jpg';
import CardGrid from '../components/card_grid.tsx';
import HotelCard from '../components/hotel_card.tsx';

function Home() {

  //mock data
  const hotelImage =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 620'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%2378a8ff'/><stop offset='100%' stop-color='%23d7e6ff'/></linearGradient></defs><rect width='900' height='620' fill='url(%23bg)'/><rect x='180' y='130' width='360' height='340' fill='%23bd735f'/><rect x='540' y='190' width='120' height='280' fill='%2394706b'/><rect x='180' y='470' width='480' height='34' fill='%23717e63'/><g fill='%23ecf2ff'><rect x='215' y='165' width='46' height='58'/><rect x='282' y='165' width='46' height='58'/><rect x='349' y='165' width='46' height='58'/><rect x='416' y='165' width='46' height='58'/><rect x='215' y='248' width='46' height='58'/><rect x='282' y='248' width='46' height='58'/><rect x='349' y='248' width='46' height='58'/><rect x='416' y='248' width='46' height='58'/><rect x='215' y='331' width='46' height='58'/><rect x='282' y='331' width='46' height='58'/><rect x='349' y='331' width='46' height='58'/><rect x='416' y='331' width='46' height='58'/></g></svg>";

  const baseHotels = [
    {
      id: "grand-azure",
      img: hotelImage,
      rating: 5,
      name: "The Grand Azure",
      chain_name: "Azure Resorts",
      city: "Toronto",
      address: "100 King St",
      starting_cost: 299,
      available_rooms: 6
    },
    {
      id: "harbour-crest",
      img: hotelImage,
      rating: 5,
      name:"Harbour Crest",
      chain_name:"Azure Resorts",
      city:"Toronto",
      address:"88 Queens Quay",
      starting_cost:259,
      available_rooms:4
    }, 
    {
      id:"cityline-suites",
      img:hotelImage,
      rating:4,
      name:"Cityline Suites",
      chain_name:"Azure Resorts",
      city:"Toronto",
      address:"12 Front St",
      starting_cost:219,
      available_rooms:8
    },
    {
      id: "lakeside-manor",
      img: hotelImage,
      rating: 5,
      name: "Lakeside Manor",
      chain_name: "Northstar Hospitality",
      city: "Montreal",
      address: "55 Rue Sainte-Catherine",
      starting_cost: 299,
      available_rooms: 6
    },
    {
      id: "summit-pacific",
      img: hotelImage,
      rating: 5,
      name:"Summit Pacific",
      chain_name:"Summit Stays",
      city:"Vancouver",
      address:"900 Granville Street",
      starting_cost:259,
      available_rooms:4
    }, 
    {
      id:"golden-key-downtown",
      img:hotelImage,
      rating:4,
      name:"Golden Key Downtown",
      chain_name:"Golden Key Collection",
      city:"Ottawa",
      address:"240 Wellington Street",
      starting_cost:219,
      available_rooms:8
    }
  ];

  const hotelMockData = baseHotels.map((hotel) => ({
    ...hotel,
    href: `/hotels/${hotel.id}/rooms`,
  }));

  const topHotelMockData = hotelMockData.slice(0, 3);

  const [heroLocation, setHeroLocation] = useState("");
  const [heroDate, setHeroDate] = useState("");
  const [heroNumGuests, setHeroNumGuests] = useState(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [numGuests, setNumGuests] = useState(null);

  const [topHotels, setTopHotels] = useState(topHotelMockData);
  const [hotels, setHotels] = useState(hotelMockData);

  // filter stuff
  const [filteredHotels, setFilteredHotels] = useState(hotelMockData);
  const [filters, setFilters] = useState({
    search: "",
    rating: [],
    minRooms: 1,
    maxPrice: 450,
    chain: "",
  });

  useEffect(() => {
    let res = [...hotels];

    // chain filter
    if (filters.chain) {
      res = res.filter((hotel) => hotel.chain_name.toLowerCase().includes(filters.chain.toLowerCase()));
    }

    // price filter
    res = res.filter((hotel) => hotel.starting_cost <= filters.maxPrice);

    // minimum available rooms filter
    res = res.filter((hotel) => hotel.available_rooms >= filters.minRooms);

    // rating filter
    if (filters.rating.length > 0) {
      res = res.filter((hotel) => filters.rating.includes(hotel.rating));
    }

    setFilteredHotels(res);
  }, [filters, hotels])

  const handleRatingChange = (value) => (e) => {
    setFilters((prev) => ({
      ...prev,
      rating: e.target.checked 
        ? [...prev.rating, value] 
        : prev.rating.filter((x) => x !== value),
    }));
  };

  // hero section on search 
  const handleHeroSearch = (e) => {
    e.preventDefault();

    const params = {
      location: heroLocation,
      date: heroDate,
      numGuests: heroNumGuests
    }

    setLocation(heroLocation);
    setDate(heroDate);
    setNumGuests(heroNumGuests);

    handleHotelSearch(params);
    scrollToResults();
  };

  const handleHotelSearch = (params) => {
    // thing
  };

  const searchSecRef = useRef(null);
  const scrollToResults = () => {
    searchSecRef.current?.scrollIntoView({behavior: "smooth"});
  };

  return (
    <div className="home flex flex-col gap-40">
      <div 
        className="relative w-full h-100 flex justify-center items-end rounded-b-lg" 
        style ={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 70%'
        }}
      >
        <div className="max-w-120 bg-white p-7 shadow-lg rounded-xl flex flex-col gap-5 translate-y-1/5">
          <p className="text-lg">Find and book the perfect room for you.</p>
          <form onSubmit={handleHeroSearch} className="flex flex-col gap-4">
            <div className="flex items-center rounded-lg border border-black/30 text-sm">
              <LocationOnOutlinedIcon className="ml-2 text-[1.35rem] text-black/55"/>
              <input 
                  placeholder="Where to?"
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  className="w-full px-2 py-3 outline-none"
              />
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex-1 flex items-center rounded-lg border border-black/30 text-sm">
                <CalendarIcon className="ml-2 text-[1.35rem] text-black/55"/>
                <input 
                    type="date"
                    value={heroDate}
                    onChange={(e) => setHeroDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-2 py-3 outline-none"
                />
              </div>
              <input 
                  placeholder="Guests"
                  value={heroNumGuests}
                  onChange={(e) => setHeroNumGuests(e.target.value)}
                  required
                  className="w-1/3 rounded-lg px-3 py-3 border border-black/30"
              />
            </div>
            <button type="submit" className="cursor-pointer flex justify-center rounded-lg bg-gradient-to-r from-primary to-blue-900 px-10 py-3 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"> 
              <SearchIcon className="mr-1 text-[1.35rem] text-white"/>
              <p>FIND HOTELS</p>
            </button>
          </form>
        </div>
      </div>

      {/* top hotels section */}
      <div className="max-w-6xl w-full mx-auto px-5 flex flex-col">
        <p className="text-3xl mb-5">Our top rated hotels, for you.</p>
        <CardGrid>
          {topHotels.map((hotel) => (
            <HotelCard 
              key={hotel.id}
              href={hotel.href}
              img={hotel.img}
              rating={hotel.rating}
              name={hotel.name}
              chain_name={hotel.chain_name}
              city={hotel.city}
              address={hotel.address}
              starting_cost={hotel.starting_cost}
              available_rooms={hotel.available_rooms}
            />
          ))}
        </CardGrid>
      </div>

      {/* main search section */}
      <div ref={searchSecRef} className="max-w-6xl w-full px-5 mx-auto flex flex-col gap-5">
        <p className="text-3xl w-full">Search through our hotels.</p>
        <div className="bg-white rounded-xl p-7 shadow-lg w-full">
          <form onSubmit={handleHotelSearch} className="flex flex-col md:flex-row gap-3 md:gap-5 w-full">
            <div className="flex-1 flex items-center rounded-lg border border-black/30 text-sm">
              <LocationOnOutlinedIcon className="ml-2 text-[1.35rem] text-black/55"/>
              <input 
                  placeholder="Where to?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-2 py-3 outline-none"
              />
            </div>
            <div className="flex-1 flex items-center rounded-lg border border-black/30 text-sm">
              <CalendarIcon className="ml-2 text-[1.35rem] text-black/55"/>
              <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-2 py-3 outline-none"
              />
            </div>
            <input 
                placeholder="Guests"
                value={numGuests}
                onChange={(e) => setNumGuests(e.target.value)}
                required
                className="text-sm w-full md:w-1/6 rounded-lg px-3 py-3 border border-black/30"
            />
            <button type="submit" className="cursor-pointer flex justify-center rounded-lg bg-gradient-to-r from-primary to-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"> 
              <SearchIcon className="mr-1 text-[1.35rem] text-white"/>
              <p>SEARCH</p>
            </button>
          </form>
        </div>
        <div className="flex flex-col md:flex-row gap-12">

          {/* filters */}
          <aside className="h-fit rounded-xl bg-white p-8 shadow-lg md:min-w-70">
            <div className="flex items-center">
              <FilterIcon className="text-[1.2rem] text-black/55"/>
              <p className="text-sm font-semibold text-slate-500">
                Filters
              </p>
            </div>
            <div className="mt-5 space-y-5 text-sm text-slate-600">
              <div>
                <p className="font-medium text-slate-900">Hotel Chain</p>
                <div className="flex items-center rounded-lg border border-black/30 text-sm mt-2">
                  <SearchIcon className="ml-2 text-[1.2rem] text-black/55"/>
                  <input 
                      placeholder="Search hotel chains"
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          chain: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-2 outline-none"
                  />
                </div>
              </div>
              <div>
                <p className="font-medium text-slate-900">Rating</p>
                <div className="mt-2 text-lg text-yellow-500">
                  <label className="flex items-center gap-2"><input type="checkbox" onChange={handleRatingChange(5)} checked={filters.rating.includes(5)} />★★★★★</label>
                  <label className="flex items-center gap-2"><input type="checkbox" onChange={handleRatingChange(4)} checked={filters.rating.includes(4)} />★★★★</label>
                  <label className="flex items-center gap-2"><input type="checkbox" onChange={handleRatingChange(3)} checked={filters.rating.includes(3)} />★★★</label>
                  <label className="flex items-center gap-2"><input type="checkbox" onChange={handleRatingChange(2)} checked={filters.rating.includes(2)} />★★</label>
                  <label className="flex items-center gap-2"><input type="checkbox" onChange={handleRatingChange(1)} checked={filters.rating.includes(1)} />★</label>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">Number of Rooms</p>
                  <span>{filters.minRooms}+</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={filters.minRooms}
                  className="mt-3 w-full"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minRooms: Number(e.target.value),
                    }))
                  }
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>1+</span>
                  <span>10+</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">Price Range</p>
                  <span>${filters.maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  value={filters.maxPrice}
                  className="mt-3 w-full" 
                  onChange={(e) => 
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: Number(e.target.value),
                    }))
                  }
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>$0</span>
                  <span>$1000</span>
                </div>
              </div>
            </div>
          </aside>

          {/* results */}
          <div className="flex flex-col gap-5 w-full">
            <div className="flex justify-between w-full">
              <p className="text-2xl">{filteredHotels.length} hotel{filteredHotels.length === 1 ? "" : "s"} found.</p>
              <p>add dropdown tab here eventually</p>
            </div>
            <CardGrid>
              {filteredHotels.map((hotel) => (
                <HotelCard 
                  key={hotel.id}
                  href={hotel.href}
                  img={hotel.img}
                  rating={hotel.rating}
                  name={hotel.name}
                  chain_name={hotel.chain_name}
                  city={hotel.city}
                  address={hotel.address}
                  starting_cost={hotel.starting_cost}
                  available_rooms={hotel.available_rooms}
                />
              ))}
            </CardGrid>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Home;
