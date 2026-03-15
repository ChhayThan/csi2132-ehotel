import HotelCard from "../components/hotel_card";
import CardGrid from "../components/card_grid";
import RoomDetailCard from "../components/room_detail_card";


// Mock stuff

const roomImage =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 720'><defs><linearGradient id='sky' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23ebe7df'/><stop offset='100%' stop-color='%23bfd5dc'/></linearGradient></defs><rect width='1200' height='720' fill='url(%23sky)'/><rect x='0' y='220' width='760' height='360' rx='10' fill='%23d9d2c7'/><rect x='0' y='310' width='760' height='270' fill='%23f4f4f2'/><rect x='80' y='330' width='420' height='160' rx='10' fill='%23ffffff'/><rect x='500' y='288' width='108' height='92' rx='8' fill='%237c776f'/><rect x='520' y='226' width='70' height='70' rx='8' fill='%23f7e6b4'/><rect x='805' y='170' width='320' height='300' rx='10' fill='%23f3f8fb'/><rect x='840' y='205' width='250' height='220' rx='4' fill='%2392c9e8'/><rect x='810' y='460' width='150' height='110' rx='75' fill='%23bcc9c6'/><ellipse cx='920' cy='630' rx='270' ry='65' fill='%2394b7b5'/><circle cx='910' cy='560' r='72' fill='none' stroke='%23363a40' stroke-width='10'/><line x1='875' y1='620' x2='950' y2='510' stroke='%23363a40' stroke-width='10'/></svg>";

const hotelImage =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 620'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%2378a8ff'/><stop offset='100%' stop-color='%23d7e6ff'/></linearGradient></defs><rect width='900' height='620' fill='url(%23bg)'/><rect x='180' y='130' width='360' height='340' fill='%23bd735f'/><rect x='540' y='190' width='120' height='280' fill='%2394706b'/><rect x='180' y='470' width='480' height='34' fill='%23717e63'/><g fill='%23ecf2ff'><rect x='215' y='165' width='46' height='58'/><rect x='282' y='165' width='46' height='58'/><rect x='349' y='165' width='46' height='58'/><rect x='416' y='165' width='46' height='58'/><rect x='215' y='248' width='46' height='58'/><rect x='282' y='248' width='46' height='58'/><rect x='349' y='248' width='46' height='58'/><rect x='416' y='248' width='46' height='58'/><rect x='215' y='331' width='46' height='58'/><rect x='282' y='331' width='46' height='58'/><rect x='349' y='331' width='46' height='58'/><rect x='416' y='331' width='46' height='58'/></g></svg>";

const amenities = [
  "Free WiFi",
  "Free toiletries",
  "Heating",
  "Air conditioning",
  "Bedsheets",
  "Pillows",
  "TV",
  "Kitchen",
  "Cookware/dishware",
  "Utensils",
  "Mini fridge",
  "Balcony",
];

function ComponentPreviewPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7fb_0%,#edf2f8_52%,#f8fafc_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                Component Preview
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Search through our rooms.
              </h1>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Responsive card layouts and room details built to match the current
              eHotels visual style.
            </p>
          </div>

          <div className="mt-8">
            <CardGrid>
              <HotelCard
                href="/rooms/123"
                img={hotelImage}
                rating={4.95}
                name="The Grand Azure"
                chain_name="Azure Resorts"
                city="Toronto"
                address="100 King St"
                starting_cost={299}
                available_rooms={6}
              />
              <HotelCard
                href="/rooms/124"
                img={hotelImage}
                rating={4.82}
                name="Harbour Crest"
                chain_name="Azure Resorts"
                city="Toronto"
                address="88 Queens Quay"
                starting_cost={259}
                available_rooms={4}
              />
              <HotelCard
                href="/rooms/125"
                img={hotelImage}
                rating={4.71}
                name="Cityline Suites"
                chain_name="Azure Resorts"
                city="Toronto"
                address="12 Front St"
                starting_cost={219}
                available_rooms={8}
              />
            </CardGrid>
          </div>
        </section>

        <RoomDetailCard
          hotelName="The Grand Azure"
          chainName="Azure Resorts"
          address="Toronto - 100 King St"
          roomName="Room 123"
          roomSubtitle="Single (fits 2 guests)"
          viewLabel="Ocean View"
          image={roomImage}
          rating={4.95}
          reviewCount={641}
          amenities={amenities}
          contactEmail="hotel-email@example.com"
          contactPhone="123-456-7890"
          problemMessage="The air conditioning is currently under repair. Expected repair date: April 19th."
        />
      </div>
    </main>
  );
}

export default ComponentPreviewPage;
