import { Route, Routes } from "react-router-dom";
import ComponentPreviewPage from "./component_preview_page";
import ConfirmBookingPage from "./confirm_booking_page";
import Home from "./home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/preview/components" element={<ComponentPreviewPage />} />
      <Route path="/preview/confirm-booking" element={<ConfirmBookingPage />} />
    </Routes>
  );
}

export default App;
