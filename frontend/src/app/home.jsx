import { useState, useEffect, useRef, useMemo } from 'react';

import SearchIcon from "@mui/icons-material/SearchOutlined";
import CalendarIcon from "@mui/icons-material/CalendarMonth";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import FilterIcon from "@mui/icons-material/FilterAltOutlined";

import heroBg from '../assets/hero_bg.jpg';
import CardGrid from '../components/card_grid.tsx';
import HotelCard from '../components/hotel_card.tsx';
import { getAvailableHotels, getAvailableRoomsForHotel, getRoomCountsByCity, getTopHotels } from '../lib/public_api.js';
import { buildHotelRoomsHref, hasValidStayDates } from '../lib/booking_flow_utils.js';

function Home() {
  const hotelImage =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 620'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%2378a8ff'/><stop offset='100%' stop-color='%23d7e6ff'/></linearGradient></defs><rect width='900' height='620' fill='url(%23bg)'/><rect x='180' y='130' width='360' height='340' fill='%23bd735f'/><rect x='540' y='190' width='120' height='280' fill='%2394706b'/><rect x='180' y='470' width='480' height='34' fill='%23717e63'/><g fill='%23ecf2ff'><rect x='215' y='165' width='46' height='58'/><rect x='282' y='165' width='46' height='58'/><rect x='349' y='165' width='46' height='58'/><rect x='416' y='165' width='46' height='58'/><rect x='215' y='248' width='46' height='58'/><rect x='282' y='248' width='46' height='58'/><rect x='349' y='248' width='46' height='58'/><rect x='416' y='248' width='46' height='58'/><rect x='215' y='331' width='46' height='58'/><rect x='282' y='331' width='46' height='58'/><rect x='349' y='331' width='46' height='58'/><rect x='416' y='331' width='46' height='58'/></g></svg>";
  const DEFAULT_GUESTS = 2;
  const DEFAULT_STAY_NIGHTS = 2;
  const COUNTRY_ALIASES = {
    us: "US",
    usa: "US",
    "united states": "US",
    "united states of america": "US",
    ca: "CA",
    can: "CA",
    canada: "CA",
  };

  const formatApiDate = (date) => date.toISOString().split("T")[0];
  const defaultCheckinDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return formatApiDate(date);
  }, []);
  const defaultCheckoutDate = useMemo(() => {
    const date = new Date(`${defaultCheckinDate}T00:00:00`);
    date.setDate(date.getDate() + DEFAULT_STAY_NIGHTS);
    return formatApiDate(date);
  }, [defaultCheckinDate]);

  const normalizeCountry = (countryInput) => {
    const normalized = COUNTRY_ALIASES[countryInput.trim().toLowerCase()];
    return normalized ?? null;
  };

  const parseLocationInput = (input) => {
    const cleaned = input.trim();

    if (!cleaned) {
      return [];
    }

    const [cityPart, countryPart] = cleaned.split(",").map((value) => value.trim()).filter(Boolean);

    if (cityPart && countryPart) {
      const normalizedCountry = normalizeCountry(countryPart);
      return normalizedCountry ? [{ city: cityPart, country: normalizedCountry }] : [];
    }

    return ["CA", "US"].map((country) => ({ city: cleaned, country }));
  };

  const resolveHotelImage = (image) => {
    if (typeof image === "string" && (image.startsWith("http") || image.startsWith("data:image"))) {
      return image;
    }

    return hotelImage;
  };

  const mapHotelToCard = (hotel, checkinDate, checkoutDate, guests) => ({
    id: hotel.hid,
    href: buildHotelRoomsHref(hotel.hid, checkinDate, checkoutDate, guests),
    img: resolveHotelImage(hotel.image),
    rating: Number(hotel.rating),
    name: hotel.name,
    chain_name: hotel.chain_name,
    city: hotel.address?.city ?? "",
    address: hotel.address?.street_address ?? "",
    starting_cost: Number(hotel.min_price ?? 0),
    available_rooms: Number(hotel.num_available_rooms ?? 0),
  });

  const [heroLocation, setHeroLocation] = useState("");
  const [heroDate, setHeroDate] = useState(defaultCheckinDate);
  const [heroCheckoutDate, setHeroCheckoutDate] = useState(defaultCheckoutDate);
  const [heroNumGuests, setHeroNumGuests] = useState(String(DEFAULT_GUESTS));
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(defaultCheckinDate);
  const [checkoutDate, setCheckoutDate] = useState(defaultCheckoutDate);
  const [numGuests, setNumGuests] = useState(String(DEFAULT_GUESTS));

  const [topHotels, setTopHotels] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [roomCountsByCity, setRoomCountsByCity] = useState([]);
  const [topHotelsLoading, setTopHotelsLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [roomCountsLoading, setRoomCountsLoading] = useState(true);
  const [resultsMessage, setResultsMessage] = useState("");
  const [roomCountsMessage, setRoomCountsMessage] = useState("");
  const [activeSearch, setActiveSearch] = useState({
    checkinDate: defaultCheckinDate,
    checkoutDate: defaultCheckoutDate,
    guests: DEFAULT_GUESTS,
    location: "",
  });

  // filter stuff
  const [filteredHotels, setFilteredHotels] = useState([]);
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

  useEffect(() => {
    let isActive = true;

    async function loadInitialData() {
      setTopHotelsLoading(true);
      setResultsLoading(true);
      setRoomCountsLoading(true);
      setResultsMessage("");
      setRoomCountsMessage("");

      try {
        const [topHotelsResponse, defaultHotelsResponse, roomCountsResponse] = await Promise.all([
          getTopHotels(3),
          getTopHotels(8),
          getRoomCountsByCity(),
        ]);

        const enrichedDefaultHotels = await Promise.all(
          defaultHotelsResponse.map(async (hotel) => {
            try {
              const availableRooms = await getAvailableRoomsForHotel(hotel.hid, defaultCheckinDate, defaultCheckoutDate);
              return {
                ...hotel,
                num_available_rooms: availableRooms.length,
              };
            } catch {
              return {
                ...hotel,
                num_available_rooms: 0,
              };
            }
          }),
        );

        if (!isActive) {
          return;
        }

        setTopHotels(topHotelsResponse.map((hotel) => mapHotelToCard(hotel, defaultCheckinDate, defaultCheckoutDate, DEFAULT_GUESTS)));
        setHotels(enrichedDefaultHotels.map((hotel) => mapHotelToCard(hotel, defaultCheckinDate, defaultCheckoutDate, DEFAULT_GUESTS)));
        setRoomCountsByCity(
          [...roomCountsResponse].sort((a, b) => Number(b.num_rooms) - Number(a.num_rooms)),
        );
      } catch {
        if (!isActive) {
          return;
        }

        setTopHotels([]);
        setHotels([]);
        setRoomCountsByCity([]);
        setResultsMessage("Unable to load hotels right now.");
        setRoomCountsMessage("Unable to load room counts right now.");
      } finally {
        if (isActive) {
          setTopHotelsLoading(false);
          setResultsLoading(false);
          setRoomCountsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isActive = false;
    };
  }, [defaultCheckinDate, defaultCheckoutDate]);

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
      checkinDate: heroDate,
      checkoutDate: heroCheckoutDate,
      numGuests: heroNumGuests,
    };

    setLocation(heroLocation);
    setDate(heroDate);
    setCheckoutDate(heroCheckoutDate);
    setNumGuests(heroNumGuests);

    handleHotelSearch(params);
    scrollToResults();
  };

  const handleHotelSearch = async (paramsOrEvent) => {
    const params = paramsOrEvent?.preventDefault
      ? {
          location,
          checkinDate: date,
          checkoutDate,
          numGuests,
        }
      : paramsOrEvent;

    if (paramsOrEvent?.preventDefault) {
      paramsOrEvent.preventDefault();
    }

    const parsedLocations = parseLocationInput(params.location || "");
    const normalizedGuests = Math.max(1, Number(params.numGuests) || DEFAULT_GUESTS);
    const checkinDate = params.checkinDate || "";
    const resolvedCheckoutDate = params.checkoutDate || "";

    if (!hasValidStayDates(checkinDate, resolvedCheckoutDate)) {
      setResultsMessage("Choose both a valid check-in and checkout date.");
      setHotels([]);
      setActiveSearch((current) => ({
        ...current,
        checkinDate,
        checkoutDate: resolvedCheckoutDate,
        guests: normalizedGuests,
        location: params.location || "",
      }));
      return;
    }

    if (parsedLocations.length === 0) {
      setResultsMessage("Enter a location as City, Country or just City.");
      setHotels([]);
      setActiveSearch((current) => ({
        ...current,
        checkinDate,
        checkoutDate: resolvedCheckoutDate,
        guests: normalizedGuests,
        location: params.location || "",
      }));
      return;
    }

    setResultsLoading(true);
    setResultsMessage("");

    try {
      const responses = await Promise.all(
        parsedLocations.map(({ city, country }) =>
          getAvailableHotels({
            city,
            country,
            checkinDate,
            checkoutDate: resolvedCheckoutDate,
          }).catch(() => []),
        ),
      );

      const dedupedHotels = Array.from(
        new Map(
          responses
            .flat()
            .map((hotel) => [hotel.hid, hotel]),
        ).values(),
      );

      setHotels(dedupedHotels.map((hotel) => mapHotelToCard(hotel, checkinDate, resolvedCheckoutDate, normalizedGuests)));
      setActiveSearch({
        checkinDate,
        checkoutDate: resolvedCheckoutDate,
        guests: normalizedGuests,
        location: params.location || "",
      });

      if (dedupedHotels.length === 0) {
        setResultsMessage("No hotels matched that search.");
      }
    } catch {
      setHotels([]);
      setResultsMessage("Unable to search hotels right now.");
    } finally {
      setResultsLoading(false);
    }
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
                    required
                    className="w-full px-2 py-3 outline-none"
                />
              </div>
              <div className="flex-1 flex items-center rounded-lg border border-black/30 text-sm">
                <CalendarIcon className="ml-2 text-[1.35rem] text-black/55"/>
                <input 
                    type="date"
                    value={heroCheckoutDate}
                    onChange={(e) => setHeroCheckoutDate(e.target.value)}
                    min={heroDate || new Date().toISOString().split("T")[0]}
                    required
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
        {topHotelsLoading ? <p className="text-sm text-slate-500">Loading top hotels...</p> : null}
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
      <div id="browse" ref={searchSecRef} className="max-w-6xl w-full px-5 mx-auto flex flex-col gap-5">
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
                  required
                  className="w-full px-2 py-3 outline-none"
              />
            </div>
            <div className="flex-1 flex items-center rounded-lg border border-black/30 text-sm">
              <CalendarIcon className="ml-2 text-[1.35rem] text-black/55"/>
              <input 
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  min={date || new Date().toISOString().split("T")[0]}
                  required
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
              <p className="text-sm text-slate-500">
                {activeSearch.location
                  ? `Available for ${activeSearch.checkinDate} to ${activeSearch.checkoutDate}`
                  : "Top hotel results"}
              </p>
            </div>
            {resultsLoading ? <p className="text-sm text-slate-500">Loading hotels...</p> : null}
            {resultsMessage ? <p className="text-sm text-slate-500">{resultsMessage}</p> : null}
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


      <div id="city-room-counts" className="max-w-6xl w-full mx-auto px-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-3xl">Available rooms by city.</p>
          <p className="text-sm text-slate-500">A quick look at today&apos;s room inventory across our cities.</p>
        </div>

        {roomCountsLoading ? <p className="text-sm text-slate-500">Loading room counts...</p> : null}
        {roomCountsMessage ? <p className="text-sm text-slate-500">{roomCountsMessage}</p> : null}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {roomCountsByCity.map((entry) => (
            <article
              key={entry.city}
              className="rounded-2xl border border-black/8 bg-white px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">City</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">{entry.city}</h3>
                </div>
                <LocationOnOutlinedIcon className="text-primary" />
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Available rooms</p>
                <p className="mt-2 text-4xl font-bold text-slate-950">{entry.num_rooms}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>

  );
}

export default Home;
