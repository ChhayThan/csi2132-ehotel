import { useMemo, useState } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import AddEntity from "../components/add_entity";
import DeleteEntityModal from "../components/delete_entity_modal";
import EmployeeCard from "../components/employee_card";
import EditEntityModal from "../components/edit_entity_modal";
import HotelChainCard from "../components/hotel_chain_card";
import HotelCard from "../components/hotel_card";
import RoomCard from "../components/room_card";
import Navbar from "../components/navbar/navbar";


const adminData = [
  {
    id: "azure-resorts",
    name: "Azure Resorts",
    city: "Toronto",
    address: "100 King Street",
    email: "hotelchain@email.com",
    phone: "(123) 456-7890",
    hotels: [
      {
        id: "grand-azure",
        name: "The Grand Azure",
        city: "Toronto",
        address: "100 King Street",
        rating: 4.95,
        reviewCount: 641,
        email: "hotelchain@email.com",
        phone: "(123) 456-7890",
        employees: [
          { id: "E011122233", name: "Eric Chhour", role: "Admin" },
          { id: "E011122234", name: "Leonardo Atalla", role: "Clerk" },
          { id: "E011122235", name: "Xuan Pham", role: "Valet" },
          { id: "E011122236", name: "Mia Chen", role: "Manager" },
          { id: "E011122237", name: "Noah Patel", role: "Receptionist" },
          { id: "E011122238", name: "Ava Thompson", role: "Housekeeping" },
        ],
        rooms: [
          { id: 101, roomNumber: 101, price: 299, roomType: "Single", view: "City View" },
          { id: 102, roomNumber: 102, price: 299, roomType: "Double", view: "City View" },
          { id: 103, roomNumber: 103, price: 299, roomType: "Double", view: "Ocean View" },
          { id: 104, roomNumber: 104, price: 329, roomType: "Suite", view: "Ocean View" },
          { id: 201, roomNumber: 201, price: 299, roomType: "Single", view: "City View" },
          { id: 202, roomNumber: 202, price: 299, roomType: "Double", view: "Ocean View" },
          { id: 1001, roomNumber: 1001, price: 499, roomType: "Suite", view: "Ocean View" },
          { id: 1002, roomNumber: 1002, price: 499, roomType: "Suite", view: "Ocean View" },
        ],
      },
      {
        id: "harbour-crest",
        name: "Harbour Crest",
        city: "Toronto",
        address: "88 Queens Quay",
        rating: 4.88,
        reviewCount: 492,
        email: "harbourcrest@email.com",
        phone: "(123) 456-7801",
        employees: [
          { id: "E021122233", name: "Olivia Brown", role: "Manager" },
          { id: "E021122234", name: "Liam Wilson", role: "Clerk" },
        ],
        rooms: [
          { id: 301, roomNumber: 301, price: 259, roomType: "Single", view: "Harbour View" },
          { id: 302, roomNumber: 302, price: 289, roomType: "Double", view: "Harbour View" },
        ],
      },
      {
        id: "cityline-suites",
        name: "Cityline Suites",
        city: "Toronto",
        address: "12 Front Street",
        rating: 4.71,
        reviewCount: 318,
        email: "cityline@email.com",
        phone: "(123) 456-7802",
        employees: [
          { id: "E031122233", name: "Sophia Martin", role: "Receptionist" },
        ],
        rooms: [
          { id: 401, roomNumber: 401, price: 219, roomType: "Single", view: "City View" },
        ],
      },
    ],
  },
  {
    id: "northstar-hospitality",
    name: "Northstar Hospitality",
    city: "Montreal",
    address: "55 Rue Sainte-Catherine",
    email: "northstar@email.com",
    phone: "(514) 555-0123",
    hotels: [
      {
        id: "northstar-central",
        name: "Northstar Central",
        city: "Montreal",
        address: "55 Rue Sainte-Catherine",
        rating: 4.83,
        reviewCount: 412,
        email: "central@email.com",
        phone: "(514) 555-0148",
        employees: [{ id: "E041122233", name: "Emma Roy", role: "Admin" }],
        rooms: [{ id: 501, roomNumber: 501, price: 279, roomType: "Double", view: "City View" }],
      },
    ],
  },
  {
    id: "summit-stays",
    name: "Summit Stays",
    city: "Vancouver",
    address: "900 Granville Street",
    email: "summit@email.com",
    phone: "(604) 555-0188",
    hotels: [
      {
        id: "summit-pacific",
        name: "Summit Pacific",
        city: "Vancouver",
        address: "900 Granville Street",
        rating: 4.77,
        reviewCount: 280,
        email: "pacific@email.com",
        phone: "(604) 555-0110",
        employees: [{ id: "E051122233", name: "Lucas Green", role: "Manager" }],
        rooms: [{ id: 601, roomNumber: 601, price: 319, roomType: "Suite", view: "Ocean View" }],
      },
    ],
  },
  {
    id: "golden-key-collection",
    name: "Golden Key Collection",
    city: "Ottawa",
    address: "240 Wellington Street",
    email: "goldenkey@email.com",
    phone: "(613) 555-0161",
    hotels: [
      {
        id: "golden-key-downtown",
        name: "Golden Key Downtown",
        city: "Ottawa",
        address: "240 Wellington Street",
        rating: 4.69,
        reviewCount: 201,
        email: "downtown@email.com",
        phone: "(613) 555-0162",
        employees: [{ id: "E061122233", name: "Ethan Clark", role: "Clerk" }],
        rooms: [{ id: 701, roomNumber: 701, price: 239, roomType: "Double", view: "City View" }],
      },
    ],
  },
  {
    id: "maple-luxe",
    name: "Maple Luxe",
    city: "Calgary",
    address: "18 Stephen Avenue",
    email: "mapleluxe@email.com",
    phone: "(403) 555-0147",
    hotels: [
      {
        id: "maple-luxe-west",
        name: "Maple Luxe West",
        city: "Calgary",
        address: "18 Stephen Avenue",
        rating: 4.73,
        reviewCount: 156,
        email: "west@email.com",
        phone: "(403) 555-0148",
        employees: [{ id: "E071122233", name: "Charlotte White", role: "Admin" }],
        rooms: [{ id: 801, roomNumber: 801, price: 249, roomType: "Single", view: "Mountain View" }],
      },
    ],
  },
];

const addLabels = {
  chains: "+ ADD HOTEL CHAIN",
  hotels: "+ ADD HOTEL",
  employees: "+ ADD EMPLOYEE",
  rooms: "+ ADD ROOM",
};

function AdminManageDatabasePage() {
  const [view, setView] = useState("chains");
  const [selectedChainId, setSelectedChainId] = useState(adminData[0].id);
  const [selectedHotelId, setSelectedHotelId] = useState(adminData[0].hotels[0].id);
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [editEntityTarget, setEditEntityTarget] = useState(null);
  const [deleteEntityTarget, setDeleteEntityTarget] = useState(null);

  const selectedChain = useMemo(
    () => adminData.find((chain) => chain.id === selectedChainId) ?? adminData[0],
    [selectedChainId]
  );

  const selectedHotel = useMemo(
    () => selectedChain.hotels.find((hotel) => hotel.id === selectedHotelId) ?? selectedChain.hotels[0],
    [selectedChain, selectedHotelId]
  );

  const openHotels = (chainId) => {
    const chain = adminData.find((item) => item.id === chainId);
    if (!chain) {
      return;
    }
    setSelectedChainId(chain.id);
    setSelectedHotelId(chain.hotels[0]?.id ?? "");
    setView("hotels");
  };

  const openEmployees = (hotelId) => {
    setSelectedHotelId(hotelId);
    setView("employees");
  };

  const openRooms = (hotelId) => {
    setSelectedHotelId(hotelId);
    setView("rooms");
  };

  const handleBack = () => {
    if (view === "hotels") {
      setView("chains");
      return;
    }

    if (view === "employees" || view === "rooms") {
      setView("hotels");
    }
  };

  const heading = {
    chains: "Manage Hotel Chains",
    hotels: "Manage Hotels",
    employees: "Manage Employees",
    rooms: "Manage Rooms",
  }[view];

  const totalCount = {
    chains: adminData.length,
    hotels: selectedChain.hotels.length,
    employees: selectedHotel.employees.length,
    rooms: selectedHotel.rooms.length,
  }[view];

  const countLabel = {
    chains: "hotel chains",
    hotels: "hotels",
    employees: "employees",
    rooms: "rooms",
  }[view];

  const entityType = {
    chains: "HotelChain",
    hotels: "Hotel",
    employees: "Employee",
    rooms: "Room",
  }[view];

  const openEditEntity = (target) => {
    setEditEntityTarget(target);
  };

  const openDeleteEntity = (target) => {
    setDeleteEntityTarget(target);
  };

  const handleMockEdit = (values) => {
    console.log("Mock edit entity", {
      entity: editEntityTarget?.entity,
      target: editEntityTarget?.entityName,
      values,
    });
  };

  const handleMockDelete = () => {
    console.log("Mock delete entity", {
      entity: deleteEntityTarget?.entity,
      target: deleteEntityTarget?.entityName,
    });
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-[calc(100vh-2rem)] bg-[#f4f7fb] shadow-[0_25px_60px_rgba(0,0,0,0.28)]">
        <Navbar user_type="Admin" user_name="Eric Chhour" currency="CAD" setCurrency={() => {}} />

        <main className="px-4 pb-12 pt-28 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            {view !== "chains" ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex cursor-pointer items-center gap-2 self-start text-lg text-slate-500 transition hover:text-slate-800"
              >
                <ArrowBackIosNewRoundedIcon className="text-[1rem]" />
                <span>
                  back to {view === "hotels" ? "hotel chains" : "hotels"}
                </span>
              </button>
            ) : null}

            <section className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div />

              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{heading}</h1>
                {view !== "chains" ? (
                  <div className="mt-2">
                    <p className="text-2xl font-medium uppercase tracking-wide text-primary">
                      {selectedChain.name}
                    </p>
                    {view === "employees" || view === "rooms" ? (
                      <p className="text-[2rem] text-slate-800">{selectedHotel.name}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex justify-center lg:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddEntityOpen(true)}
                  className="cursor-pointer rounded-xl bg-[#0a8a19] px-6 py-3 text-sm font-bold tracking-wide text-white shadow-[0_5px_12px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
                >
                  {addLabels[view]}
                </button>
              </div>
            </section>

            <section className="space-y-5">
              <h2 className="text-3xl font-medium text-slate-950">
                {totalCount} {countLabel} found.
              </h2>

              <div className="space-y-4">
                {view === "chains"
                  ? adminData.map((chain) => (
                      <HotelChainCard
                        key={chain.id}
                        name={chain.name}
                        city={chain.city}
                        address={chain.address}
                        hotels_count={chain.hotels.length}
                        email={chain.email}
                        phone={chain.phone}
                        onEdit={() =>
                          openEditEntity({
                            entity: "HotelChain",
                            entityName: chain.name,
                            initialValues: {
                              name: chain.name,
                              address: chain.address,
                              email: chain.email,
                              phone: chain.phone,
                            },
                          })
                        }
                        onViewHotels={() => openHotels(chain.id)}
                        onDelete={() =>
                          openDeleteEntity({
                            entity: "HotelChain",
                            entityName: chain.name,
                          })
                        }
                      />
                    ))
                  : null}

                {view === "hotels"
                  ? selectedChain.hotels.map((hotel) => (
                      <HotelCard
                        key={hotel.id}
                        variant="admin"
                        name={hotel.name}
                        rating={hotel.rating}
                        review_count={hotel.reviewCount}
                        city={hotel.city}
                        address={hotel.address}
                        rooms_count={hotel.rooms.length}
                        email={hotel.email}
                        phone={hotel.phone}
                        onEdit={() =>
                          openEditEntity({
                            entity: "Hotel",
                            entityName: hotel.name,
                            initialValues: {
                              name: hotel.name,
                              address: hotel.address,
                              email: hotel.email,
                              phone: hotel.phone,
                            },
                          })
                        }
                        onViewEmployees={() => openEmployees(hotel.id)}
                        onViewRooms={() => openRooms(hotel.id)}
                        onDelete={() =>
                          openDeleteEntity({
                            entity: "Hotel",
                            entityName: hotel.name,
                          })
                        }
                      />
                    ))
                  : null}

                {view === "employees"
                  ? selectedHotel.employees.map((employee) => (
                      <EmployeeCard
                        key={employee.id}
                        name={employee.name}
                        role={employee.role}
                        employee_id={employee.id}
                        onEdit={() =>
                          openEditEntity({
                            entity: "Employee",
                            entityName: employee.name,
                            initialValues: {
                              firstName: employee.name.split(" ")[0] ?? "",
                              lastName: employee.name.split(" ").slice(1).join(" "),
                              address: selectedHotel.address,
                              password: "password123!",
                              role: employee.role === "Admin" ? "Admin" : "Employee",
                            },
                          })
                        }
                        onDelete={() =>
                          openDeleteEntity({
                            entity: "Employee",
                            entityName: employee.name,
                          })
                        }
                      />
                    ))
                  : null}

                {view === "rooms"
                  ? selectedHotel.rooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        variant="admin"
                        room_number={room.roomNumber}
                        price={room.price}
                        room_type={room.roomType}
                        view={room.view}
                        onEdit={() =>
                          openEditEntity({
                            entity: "Room",
                            entityName: `Room ${room.roomNumber}`,
                            initialValues: {
                              roomNumber: `${room.roomNumber}`,
                              capacity: room.roomType,
                              view: room.view.replace(" View", ""),
                              amenities: room.amenities?.join(", ") ?? "",
                              problems: room.problems ?? "",
                              price: `${room.price}`,
                              extendable: false,
                            },
                          })
                        }
                        onDelete={() =>
                          openDeleteEntity({
                            entity: "Room",
                            entityName: `Room ${room.roomNumber}`,
                          })
                        }
                      />
                    ))
                  : null}
              </div>
            </section>
          </div>
        </main>
      </div>

      {isAddEntityOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-[2px]">
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto">
            <AddEntity
              entity={entityType}
              curChainName={selectedChain.name}
              curHotelName={selectedHotel.name}
              setIsActive={setIsAddEntityOpen}
            />
          </div>
        </div>
      ) : null}

      {editEntityTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-8 backdrop-blur-[2px]">
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto">
            <EditEntityModal
              entity={editEntityTarget.entity}
              entityName={editEntityTarget.entityName}
              initialValues={editEntityTarget.initialValues}
              setIsActive={() => setEditEntityTarget(null)}
              onSave={handleMockEdit}
            />
          </div>
        </div>
      ) : null}

      {deleteEntityTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-8 backdrop-blur-[2px]">
          <DeleteEntityModal
            entity={deleteEntityTarget.entity}
            entityName={deleteEntityTarget.entityName}
            setIsActive={() => setDeleteEntityTarget(null)}
            onDelete={handleMockDelete}
          />
        </div>
      ) : null}
    </div>
  );
}

export default AdminManageDatabasePage;
