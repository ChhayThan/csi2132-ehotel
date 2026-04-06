import { apiRequest } from "./api";

//employee endpoints

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

//admin endpoints
export function getHotelChains(token) {
  return apiRequest("/admin/hotel_chains", { 
    token,
  });
}

export function getHotels(chain_name, token) {
  return apiRequest(`/admin/hotel_chains/${chain_name}/hotels`, { 
    token,
  });
}

export function getRooms(hotelId, token) {
  return apiRequest(`/admin/hotels/${hotelId}/rooms`, { 
    token,
  });
}

export function getEmployees(hotelId, token) {
  return apiRequest(`/admin/hotels/${hotelId}/employees`, { 
    token,
  });
}