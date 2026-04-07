import { useMemo, useState, useEffect } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import AddEntity from "../components/add_entity";
import DeleteEntityModal from "../components/delete_entity_modal";
import EmployeeCard from "../components/employee_card";
import EditEntityModal from "../components/edit_entity_modal";
import HotelChainCard from "../components/hotel_chain_card";
import HotelCard from "../components/hotel_card";
import RoomCard from "../components/room_card";
import Navbar from "../components/navbar/navbar";

import { useAuth, isUnauthorizedError } from "../context/auth_context";
import {
  getHotelChains,
  getHotels,
  getEmployees,
  getRooms,
  createHotelChain,
  editHotelChain,
  deleteHotelChain,
  createHotel,
  editHotel,
  deleteHotel,
  createRoom,
  editRoom,
  deleteRoom,
  createEmployee,
  editEmployee,
  deleteEmployee,
} from "../lib/protected_api";

const addLabels = {
  chains: "+ ADD HOTEL CHAIN",
  hotels: "+ ADD HOTEL",
  employees: "+ ADD EMPLOYEE",
  rooms: "+ ADD ROOM",
};

function AdminManageDatabasePage() {
  const [view, setView] = useState("chains");
  const [selectedChainId, setSelectedChainId] = useState(null);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [editEntityTarget, setEditEntityTarget] = useState(null);
  const [deleteEntityTarget, setDeleteEntityTarget] = useState(null);

  const { token, logout, displayName } = useAuth();
  const [adminData, setAdminData] = useState([])
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // fetch all data at once, small dataset so this is okay
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const hotelChains = await getHotelChains(token);

        // get hotels per chain
        const data = await Promise.all(
          hotelChains.map(async (hotelChain) => {
            const hotels = await getHotels(hotelChain.name, token);

            // get rooms and employees for each hotel
            const detailsForHotel = await Promise.all(
              hotels.map(async (hotel) => {
                const [employees, rooms] = await Promise.all([
                  getEmployees(hotel.hid, token),
                  getRooms(hotel.hid, token),
                ]);

                return {
                  ...hotel,
                  employees,
                  rooms,
                }
              })
            );

            return {
              ...hotelChain,
              hotels: detailsForHotel,
            }
          })
        );

        setAdminData(data);
        console.log(data); //tsetsttestsTESTSTE

        // initialize selected stuff
        setSelectedChainId(prev => prev ?? data[0].name);
        setSelectedHotelId(prev => prev ?? data[0].hotels[0]?.hid ?? null);
      } catch (error) {
        alert(console.error("failed to fetch data"))
      } finally {
        setLoading(false);
      };
    };

    fetchData();
  }, [token, refresh]);

  const selectedChain = useMemo(
    () => adminData.find((chain) => chain.name === selectedChainId) ?? adminData[0] ?? null,
    [selectedChainId, adminData]
  );

  const selectedHotel = useMemo(
    () => selectedChain?.hotels.find((hotel) => hotel.hid === selectedHotelId) ?? selectedChain?.hotels[0] ?? null,
    [selectedChain, selectedHotelId]
  )

  const openHotels = (chainName) => {
    const chain = adminData.find((item) => item.name === chainName);
    if (!chain) {
      return;
    }
    setSelectedChainId(chain.name);
    setSelectedHotelId(chain.hotels[0]?.hid ?? "");
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

  if (loading) {
    return <div className="mx-auto my-auto text-2xl black">Loading data...</div>
  }

  const totalCount = {
    chains: adminData.length,
    hotels: selectedChain?.hotels.length ?? 0,
    employees: selectedHotel?.employees.length ?? 0,
    rooms: selectedHotel?.rooms.length ?? 0,
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


  const handleAdd = async (values) => {
    try {
      switch (view) {
        case "chains":
          await createHotelChain({
            name: values.name,
            address: values.address,
            phone_number: values.phone,
            email_addresses: [values.email],
          }, token);
          break;
        case "hotels":
          await createHotel(selectedChain.name, {
            name: values.name,
            address: {
              street_address: values.streetAddress,
              city: values.city,
              country: values.country,
            },
            rating: 5,
            phone_number: values.phone,
            email_addresses: [values.email],
            manager_eid: parseInt(values.managerId),
          }, token);
          break;
        case "rooms":
          await createRoom(selectedHotel.hid, {
            room_number: parseInt(values.roomNumber),
            price: parseFloat(values.price),
            capacity: parseInt(values.capacity),
            view: values.view === "" || values.view === "None" ? null : values.view,
            extendable: values.extendable ?? false,
            problem: values.problems ?? "",
            amenities: values.amenities ? values.amenities.split(",").map(a => a.trim()) : [],
          }, token);
          break;
        case "employees":
          await createEmployee(selectedHotel.hid, {
            first_name: values.firstName,
            last_name: values.lastName,
            address: values.address,
            password: values.password,
            role: values.role,
          }, token);
          break;
      } 
      setRefresh(x => x + 1)
    } catch (error) {
      console.error(JSON.stringify(error));
      alert(JSON.stringify(error) || "Failed to add");
    } finally {
      setIsAddEntityOpen(false);
    }
  }

   const handleEdit = async (values) => {
    try {
      switch (view) {
        case "chains":
          await editHotelChain(editEntityTarget.entityName, {
            name: values.name,
            address: values.address,
            phone_number: values.phone,
            email_addresses: [values.email],
          }, token);
          break;
        case "hotels":
          await editHotel(editEntityTarget.entityHotelId, {
            name: values.name,
            address: {
              street_address: values.streetAddress,
              city: values.city,
              country: values.country,
            },
            phone_number: values.phone,
            email_addresses: [values.email],
          }, token);
          break;
        case "rooms":
          await editRoom(editEntityTarget.entityHotelId, editEntityTarget.entityRoomNumber, {
            room_number: parseInt(values.roomNumber),
            price: parseFloat(values.price),
            capacity: parseInt(values.capacity),
            view: values.view === "" || values.view === "None" ? null : values.view,
            extendable: values.extendable ?? false,
            problem: values.problems ?? "",
            amenities: values.amenities ? values.amenities.split(",").map(a => a.trim()) : [],
          }, token);
          break;
        case "employees":
          await editEmployee(editEntityTarget.entityEmployeeId, {
            first_name: values.firstName,
            last_name: values.lastName,
            address: values.address,
            password: values.password,
            role: values.role,
          }, token);
          break;
      } 
      setRefresh(x => x + 1)
    } catch (error) {
      alert(error.message || "Failed to edit");
    } finally {
      setEditEntityTarget(null);
    }
  }

  const handleDelete = async (values) => {
    try {
      switch (view) {
        case "chains":
          await deleteHotelChain(deleteEntityTarget.entityName, token);
          break;
        case "hotels":
          await deleteHotel(deleteEntityTarget.entityHotelId, token);
          break;
        case "rooms":
          await deleteRoom(deleteEntityTarget.entityHotelId, deleteEntityTarget.entityRoomNumber, token);
          break;
        case "employees":
          await deleteEmployee(deleteEntityTarget.entityEmployeeId, token);
          break;
      };
      setRefresh(x => x + 1)
    } catch (error) {
      alert(error.message || "Failed to delete");
    } finally {
      setDeleteEntityTarget(null);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="min-h-screen bg-[#f4f7fb] shadow-[0_25px_60px_rgba(0,0,0,0.28)]">
        <Navbar
          user_type="Admin"
          user_name={displayName}
          currency="CAD"
          setCurrency={() => {}}
          onSignOut={logout}
        />
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
                        key={chain.name}
                        name={chain.name}
                        address={chain.address}
                        hotels_count={chain.hotels.length}
                        email={chain.email_addresses?.[0]}
                        phone={chain.phone_number}
                        onEdit={() =>
                          openEditEntity({
                            entity: "HotelChain",
                            entityName: chain.name,
                            initialValues: {
                              name: chain.name,
                              address: chain.address,
                              email: chain.email_addresses?.[0],
                              phone: chain.phone_number,
                            },
                          })
                        }
                        onViewHotels={() => openHotels(chain.name)}
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
                        city={hotel.address.city}
                        address={`${hotel.address.street_address}`}
                        rooms_count={hotel.rooms.length}
                        email={hotel.email_addresses?.[0]}
                        phone={hotel.phone_number}
                        onEdit={() =>
                          openEditEntity({
                            entity: "Hotel",
                            entityName: hotel.name,
                            entityHotelId: hotel.hid,
                            initialValues: {
                              name: hotel.name,
                              address: hotel.address.street_address,
                              email: hotel.email_addresses?.[0],
                              phone: hotel.phone_number,
                            },
                          })
                        }
                        onViewEmployees={() => openEmployees(hotel.hid)}
                        onViewRooms={() => openRooms(hotel.hid)}
                        onDelete={() =>
                          openDeleteEntity({
                            entity: "Hotel",
                            entityName: hotel.name,
                            entityHotelId: hotel.hid,
                          })
                        }
                      />
                    ))
                  : null}

                {view === "employees"
                  ? selectedHotel.employees.map((employee) => (
                      <EmployeeCard
                        key={employee.id}
                        name={`${employee.first_name} ${employee.last_name}`}
                        role={employee.role}
                        employee_id={employee.id}
                        onEdit={() =>
                          openEditEntity({
                            entity: "Employee",
                            entityName: employee.first_name,
                            entityEmployeeId: employee.id,
                            initialValues: {
                              firstName: employee.first_name,
                              lastName: employee.last_name,
                              address: selectedHotel.address.street_address,
                              password: "password123!",
                              role: employee.role === "Admin" ? "Admin" : "Employee",
                            },
                          })
                        }
                        onDelete={() =>
                          openDeleteEntity({
                            entity: "Employee",
                            entityName: `${employee.first_name} ${employee.last_name}`,
                            entityEmployeeId: employee.id,
                          })
                        }
                      />
                    ))
                  : null}

                {view === "rooms"
                  ? selectedHotel.rooms.map((room) => (
                      <RoomCard
                        key={room.room_number}
                        variant="admin"
                        room_number={room.room_number}
                        price={room.price}
                        room_type={room.capacity}
                        view={room.view}
                        onEdit={() =>
                          openEditEntity({
                            entity: "Room",
                            entityName: `Room ${room.room_number}`,
                            entityHotelId: selectedHotel.hid,
                            entityRoomNumber: room.room_number,
                            initialValues: {
                              roomNumber: `${room.room_number}`,
                              capacity: room.capacity,
                              view: room.view.replace(" View", ""),
                              amenities: room.amenities?.join(", ") ?? "",
                              problems: room.problem ?? "",
                              price: `${room.price}`,
                              extendable: false,
                            },
                          })
                        }
                        onDelete={() =>
                          openDeleteEntity({
                            entity: "Room",
                            entityName: `Room ${room.roomNumber}`,
                            entityHotelId: selectedHotel.hid,
                            entityRoomNumber: room.room_number,
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
              curHotelName={selectedHotel?.name}
              setIsActive={setIsAddEntityOpen}
              onCreate={handleAdd}
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
              onSave={handleEdit}
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
            onDelete={handleDelete}
          />
        </div>
      ) : null}
    </div>
  );
}

export default AdminManageDatabasePage;
