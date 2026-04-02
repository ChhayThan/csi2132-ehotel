import { apiRequest } from "./api";

export function getTopHotels(limit = 10) {
  return apiRequest(`/hotels/top?limit=${limit}`);
}

export function getAvailableHotels({ city, country, checkinDate, checkoutDate }) {
  const params = new URLSearchParams({
    city,
    country,
    checkin_date: checkinDate,
    checkout_date: checkoutDate,
  });

  return apiRequest(`/hotels/available?${params.toString()}`);
}

export function getAvailableRoomsForHotel(hotelId, checkinDate, checkoutDate) {
  const params = new URLSearchParams({
    checkin_date: checkinDate,
    checkout_date: checkoutDate,
  });

  return apiRequest(`/hotels/${hotelId}/rooms/available?${params.toString()}`);
}

export function getRoomCountsByCity() {
  return apiRequest("/hotels/num_rooms");
}
