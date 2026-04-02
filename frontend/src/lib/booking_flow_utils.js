const roomPlaceholderSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#dbe7f6" />
        <stop offset="100%" stop-color="#f5efe6" />
      </linearGradient>
    </defs>
    <rect width="1200" height="720" fill="url(#bg)" />
    <rect x="80" y="250" width="520" height="230" rx="20" fill="#d8d3cd" />
    <rect x="120" y="300" width="430" height="130" rx="14" fill="#ffffff" />
    <rect x="650" y="140" width="420" height="360" rx="18" fill="#d9edf6" />
    <rect x="690" y="180" width="340" height="280" rx="10" fill="#9fc6d8" />
    <rect x="640" y="520" width="180" height="90" rx="45" fill="#8ba79c" />
    <text x="600" y="640" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="#334155">
      Room Preview Unavailable
    </text>
  </svg>
`);

export const ROOM_PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${roomPlaceholderSvg}`;

export function fallbackRoomImage() {
  return ROOM_PLACEHOLDER_IMAGE;
}

export function getRoomType(capacity) {
  return capacity === 4 ? "Suite" : capacity === 2 ? "Double" : "Single";
}

export function getRoomSubtitle(capacity) {
  return `${getRoomType(capacity)} (fits ${capacity} guest${capacity > 1 ? "s" : ""})`;
}

export function parseIsoDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

export function hasValidStayDates(checkinDate, checkoutDate) {
  if (!checkinDate || !checkoutDate) {
    return false;
  }

  const parsedCheckin = parseIsoDate(checkinDate);
  const parsedCheckout = parseIsoDate(checkoutDate);

  return !Number.isNaN(parsedCheckin.getTime()) &&
    !Number.isNaN(parsedCheckout.getTime()) &&
    parsedCheckout.getTime() > parsedCheckin.getTime();
}

export function buildHotelRoomsHref(hotelId, checkinDate, checkoutDate, guests = 2) {
  if (!checkinDate || !checkoutDate) {
    return `/hotels/${hotelId}/rooms`;
  }

  return `/hotels/${hotelId}/rooms?checkin=${encodeURIComponent(checkinDate)}&checkout=${encodeURIComponent(checkoutDate)}&guests=${encodeURIComponent(String(guests))}`;
}
