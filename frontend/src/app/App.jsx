import { Route, Routes } from "react-router-dom";
import ComponentPreviewPage from "./component_preview_page";
import ConfirmBookingPage from "./confirm_booking_page";
import EmployeeDashboardPage from "./employee_dashboard_page";
import EmployeeLoginPage from "./employee_login_page";
import Home from "./home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/employee/login" element={<EmployeeLoginPage />} />
      <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
      <Route path="/preview/components" element={<ComponentPreviewPage />} />
      <Route path="/preview/confirm-booking" element={<ConfirmBookingPage />} />
    </Routes>
  );
}

export default App;
