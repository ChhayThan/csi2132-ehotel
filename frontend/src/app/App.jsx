import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import AdminManageDatabasePage from "./admin_manage_database_page";
import ComponentPreviewPage from "./component_preview_page";
import ConfirmBookingPage from "./confirm_booking_page";
import EmployeeDashboardPage from "./employee_dashboard_page";
import EmployeeLoginPage from "./employee_login_page";
import HotelRoomListPage from "./hotel_room_list_page";
import Home from "./home";
import Navbar from "../components/navbar/navbar.tsx"
import ViewRoomPage from "./view_room_page";

function App() {

  const [userType, setUserType] = useState("Guest");
  const [name, setName] = useState("John Doe");
  const [currency, setCurrency] = useState("CAD");

  return (
    <div className="flex flex-col pt-18">
      <Navbar user_type={userType} user_name={name} currency={currency} setCurrency={setCurrency}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels/:hotelId/rooms" element={<HotelRoomListPage />} />
        <Route path="/rooms/:roomId" element={<ViewRoomPage />} />
        <Route path="/employee/login" element={<EmployeeLoginPage />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
        <Route path="/preview/components" element={<ComponentPreviewPage />} />
        <Route path="/preview/confirm-booking" element={<ConfirmBookingPage />} />
      </Routes>
    </div>
  );
}

export default App;
