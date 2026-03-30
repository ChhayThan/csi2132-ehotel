import { useMemo, useState } from "react";
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
import AuthGuard from "../components/auth_guard.jsx";
import { useAuth } from "../context/auth_context.jsx";
import ViewBookingPage from "./view_booking_page";
import ViewRoomPage from "./view_room_page";

function App() {
  const location = useLocation();
  const [currency, setCurrency] = useState("CAD");
  const { user, displayName, logout } = useAuth();

  const userType = useMemo(() => {
    if (!user) {
      return "Guest";
    }

    if (user.actorType === "customer") {
      return "User";
    }

    return user.role === "admin" ? "Admin" : "Employee";
  }, [user]);

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
      {showNavbar && (
        <Navbar
          user_type={userType}
          user_name={displayName}
          currency={currency}
          setCurrency={setCurrency}
          onSignOut={logout}
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin/manage-database"
          element={
            <AuthGuard
              allowedActorTypes={["employee"]}
              allowedRoles={["admin"]}
              redirectTo="/employee/login"
            >
              <AdminManageDatabasePage />
            </AuthGuard>
          }
        />
        <Route
          path="/bookings"
          element={
            <AuthGuard allowedActorTypes={["customer"]} redirectTo="/login">
              <BookingsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/bookings/:bookingId"
          element={
            <AuthGuard allowedActorTypes={["customer"]} redirectTo="/login">
              <ViewBookingPage />
            </AuthGuard>
          }
        />
        <Route path="/hotels/:hotelId/rooms" element={<HotelRoomListPage />} />
        <Route path="/rooms/:roomId" element={<ViewRoomPage />} />
        <Route
          path="/rooms/:roomId/booking"
          element={
            <AuthGuard allowedActorTypes={["customer"]} redirectTo="/login">
              <ConfirmBookingPage />
            </AuthGuard>
          }
        />
        <Route
          path="/rooms/:roomId/booking/confirmed"
          element={
            <AuthGuard allowedActorTypes={["customer"]} redirectTo="/login">
              <BookingConfirmedPage />
            </AuthGuard>
          }
        />
        <Route
          path="/login"
          element={
            <AuthGuard guestOnly>
              <UserLoginPage />
            </AuthGuard>
          }
        />
        <Route
          path="/register"
          element={
            <AuthGuard guestOnly>
              <UserRegisterPage />
            </AuthGuard>
          }
        />
        <Route
          path="/employee/login"
          element={
            <AuthGuard guestOnly>
              <EmployeeLoginPage />
            </AuthGuard>
          }
        />
        <Route
          path="/employee/dashboard"
          element={
            <AuthGuard allowedActorTypes={["employee"]} redirectTo="/employee/login">
              <EmployeeDashboardPage />
            </AuthGuard>
          }
        />
        <Route path="/preview/components" element={<ComponentPreviewPage />} />
        <Route path="/preview/confirm-booking" element={<ConfirmBookingPage />} />
      </Routes>
    </div>
  );
}

export default App;
