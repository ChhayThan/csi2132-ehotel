import { apiRequest } from "./api";

/* employee endpoints */

export function getCustomerBookings(customerId, archived, token) {
  return apiRequest(`/${encodeURIComponent(customerId)}/bookings?archived=${archived}`, {
    token,
  });
}

export function getCustomerBookingDetails(customerId, bookingId, token) {
  return apiRequest(`/${encodeURIComponent(customerId)}/bookings/${bookingId}`, {
    token,
  });
}

export function cancelCustomerBooking(customerId, bookingId, token) {
  return apiRequest(`/${encodeURIComponent(customerId)}/bookings/${bookingId}/cancel`, {
    method: "DELETE",
    token,
  });
}

export function createCustomerBooking(customerId, payload, token) {
  return apiRequest(`/${encodeURIComponent(customerId)}/bookings/new`, {
    method: "POST",
    body: payload,
    token,
  });
}

export function getHotelDetails(hotelId) {
  return apiRequest(`/hotels/${hotelId}`);
}

export function getRoomDetails(hotelId, roomNumber) {
  return apiRequest(`/hotels/${hotelId}/rooms/${roomNumber}`);
}

export function getAvailableRooms(hotelId, checkinDate, checkoutDate) {
  return apiRequest(
    `/hotels/${hotelId}/rooms/available?checkin_date=${checkinDate}&checkout_date=${checkoutDate}`,
  );
}

export function getEmployeeHotelBookings(hotelId, archived, token) {
  return apiRequest(`/employee/hotels/${hotelId}/bookings?archived=${archived}`, {
    token,
  });
}

export function getEmployeeHotelRentings(hotelId, archived, token) {
  return apiRequest(`/employee/hotels/${hotelId}/rentings?archived=${archived}`, {
    token,
  });
}

export function lookupEmployeeCustomerByEmail(email, token) {
  return apiRequest(`/employee/customers/by-email?email=${encodeURIComponent(email)}`, {
    token,
  });
}

export function createEmployeeDirectRenting(payload, token) {
  return apiRequest("/employee/rentings/direct", {
    method: "POST",
    body: payload,
    token,
  });
}

export function convertEmployeeBookingToRenting(payload, token) {
  return apiRequest("/employee/rentings/convert", {
    method: "POST",
    body: payload,
    token,
  });
}

/* admin endpoints */

// chains
export function getHotelChains(token) {
  return apiRequest("/admin/hotel_chains", { 
    token,
  });
}

export function createHotelChain (payload, token) {
  return apiRequest("/admin/hotel_chains/new", {
    method: "POST",
    body: payload,
    token,
  });
}

export function editHotelChain(chainName, payload, token) {
  return apiRequest(`/admin/hotel_chains/${encodeURIComponent(chainName)}/manage`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteHotelChain(chainName, token) {
  return apiRequest(`/admin/hotel_chains/${encodeURIComponent(chainName)}/delete`, {
    method: "DELETE",
    token,
  });
}

// hotels
export function getHotels(chainName, token) {
  return apiRequest(`/admin/hotel_chains/${chainName}/hotels`, { 
    token,
  });
}

export function createHotel (chainName, payload, token) {
  return apiRequest(`/admin/hotels/new?chain_name=${encodeURIComponent(chainName)}`, {
    method: "POST",
    body: payload,
    token,
  });
}

export function editHotel(hotelId, payload, token) {
  return apiRequest(`/admin/hotels/${hotelId}/manage`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteHotel(hotelId, token) {
  return apiRequest(`/admin/hotels/${hotelId}/delete`, {
    method: "DELETE",
    token,
  });
}

// rooms
export function getRooms(hotelId, token) {
  return apiRequest(`/admin/hotels/${hotelId}/rooms`, { 
    token,
  });
}

export function createRoom (hotelId, payload, token) {
  return apiRequest(`/admin/hotels/${hotelId}/rooms/new`, {
    method: "POST",
    body: payload,
    token,
  });
}

export function editRoom(hotelId, roomNumber, payload, token) {
  return apiRequest(`/admin/hotels/${hotelId}/rooms/${roomNumber}/manage`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteRoom(hotelId, roomNumber, token) {
  return apiRequest(`/admin/hotels/${hotelId}/rooms/${roomNumber}/delete`, {
    method: "DELETE",
    token,
  });
}

// employees
export function getEmployees(hotelId, token) {
  return apiRequest(`/admin/hotels/${hotelId}/employees`, { 
    token,
  });
}

export function createEmployee (hotelId, payload, token) {
  return apiRequest(`/admin/employees/new?hotel_id=${hotelId}`, {
    method: "POST",
    body: payload,
    token,
  });
}

export function editEmployee(employeeId, payload, token) {
  return apiRequest(`/admin/employees/${employeeId}/manage`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteEmployee(employeeId, token) {
  return apiRequest(`/admin/employees/${employeeId}/delete`, {
    method: "DELETE",
    token,
  });
}