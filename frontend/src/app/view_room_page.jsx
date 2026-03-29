import { Link, useParams } from "react-router-dom";
import BookingInformationCard from "../components/booking_information_card";
import RoomDetailCard from "../components/room_detail_card";
import { mockHotel, mockRooms } from "./mock_room_data";

function ViewRoomPage() {
  const { roomId } = useParams();
  const room = mockRooms.find((item) => item.id === roomId) ?? mockRooms[0];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#edf2f8_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Link
          to="/hotels/grand-azure/rooms"
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <span>&lt;</span>
          <span>back to rooms</span>
        </Link>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
          <RoomDetailCard
            hotelName={mockHotel.name}
            chainName={mockHotel.chainName}
            address={`${mockHotel.city} - ${mockHotel.address}`}
            roomName={`Room ${room.roomNumber}`}
            roomSubtitle={room.subtitle}
            viewLabel={`${room.view} View`}
            image={room.image}
            rating={mockHotel.rating}
            reviewCount={mockHotel.reviewCount}
            amenities={room.detailAmenities}
            contactEmail={mockHotel.contactEmail}
            contactPhone={mockHotel.contactPhone}
            problemMessage={room.problemMessage || undefined}
          />

          <div className="xl:sticky xl:top-28">
            <BookingInformationCard
              checkin_date="Thursday, March 12, 2026"
              checkout_date="Sunday, March 15, 2026"
              num_guests={2}
              estimated_total={room.price * 2}
              continue_href={`/rooms/${room.id}/booking`}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default ViewRoomPage;
