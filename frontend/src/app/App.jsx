import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import AdminManageDatabasePage from "./admin_manage_database_page";
import ComponentPreviewPage from "./component_preview_page";
import ConfirmBookingPage from "./confirm_booking_page";
import EmployeeDashboardPage from "./employee_dashboard_page";
import EmployeeLoginPage from "./employee_login.jsx";
import Home from "./home";
import UserLoginPage from "./user_login";
import UserRegisterPage from "./user_register";
import Navbar from "../components/navbar/navbar.tsx"

function App() {
  const location = useLocation();
  const [userType, setUserType] = useState("Guest");
  const [name, setName] = useState("John Doe");
  const [currency, setCurrency] = useState("CAD");

  // routes where navbar shouldn't show
  const hideNavbarRoutes = ["/login", "/employee/login", "/register"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className={`flex flex-col ${showNavbar ? "pt-18:" : ""}`}>
      {showNavbar && (<Navbar user_type={userType} user_name={name} currency={currency} setCurrency={setCurrency}/>)}
      <Routes>
        <Route path="/" element={<Home />} />
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