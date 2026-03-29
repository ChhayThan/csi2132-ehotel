import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import AdminManageDatabasePage from "./admin_manage_database_page";
import BookingConfirmedPage from "./booking_confirmed_page";
import BookingsPage from "./bookings_page";
import ComponentPreviewPage from "./component_preview_page";
import ConfirmBookingPage from "./confirm_booking_page";
import EmployeeDashboardPage from "./employee_dashboard_page";
import EmployeeLoginPage from "./employee_login_page";
import HotelRoomListPage from "./hotel_room_list_page";
import Home from "./home";
import UserLoginPage from "./user_login";
import UserRegisterPage from "./user_register";
import Navbar from "../components/navbar/navbar.tsx"
import ViewBookingPage from "./view_booking_page";
import ViewRoomPage from "./view_room_page";

function App() {
  const location = useLocation();
  const [userType, setUserType] = useState("Guest");
  const [name, setName] = useState("John Doe");
  const [currency, setCurrency] = useState("CAD");

  // routes where navbar shouldn't show
  const hideNavbarRoutes = [
    "/login",
    "/employee/login",
    "/employee/dashboard",
    "/admin/manage-database",
    "/register",
  ];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className={`flex flex-col ${showNavbar ? "pt-18" : ""}`}>
      {showNavbar && (<Navbar user_type={userType} user_name={name} currency={currency} setCurrency={setCurrency}/>)}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/manage-database" element={<AdminManageDatabasePage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/:bookingId" element={<ViewBookingPage />} />
        <Route path="/hotels/:hotelId/rooms" element={<HotelRoomListPage />} />
        <Route path="/rooms/:roomId" element={<ViewRoomPage />} />
        <Route path="/rooms/:roomId/booking" element={<ConfirmBookingPage />} />
        <Route path="/rooms/:roomId/booking/confirmed" element={<BookingConfirmedPage />} />
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/register" element={<UserRegisterPage />} />
        <Route path="/employee/login" element={<EmployeeLoginPage />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
        <Route path="/preview/components" element={<ComponentPreviewPage />} />
        <Route path="/preview/confirm-booking" element={<ConfirmBookingPage />} />
      </Routes>
    </div>
  );
}

export default App;
