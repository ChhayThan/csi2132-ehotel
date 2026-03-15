import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useState } from "react";
import { Link } from "react-router-dom";
import DropDownTab from "../components/drop_down_tab";
import Navbar from "../components/navbar/navbar";

const roomFacts = [
  "Room 123",
  "1 bedroom, 1 bathroom (fits 2 guests)",
];

const bookingRows = [
  ["Check in", "Thursday, March 12, 2026"],
  ["Checkout", "Sunday, March 15, 2026"],
  ["Guests", "2 guests"],
];

const orderRows = [
  ["Room", "123 (Double)"],
  ["Nights", "2 x Nights"],
  ["Price/Night", "$299.00"],
  ["Subtotal", "$598.00"],
  ["Taxes", "$77.74"],
];

function ConfirmBookingPage() {
  const [currency, setCurrency] = useState("CAD");
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [openTab, setOpenTab] = useState(isSignedIn ? "summary" : "signin");

  const handleMockSignIn = () => {
    setIsSignedIn(true);
    setOpenTab("summary");
  };

  const handleMockSignOut = () => {
    setIsSignedIn(false);
    setOpenTab("signin");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#edf1f7_100%)]">
      <Navbar
        user_type={isSignedIn ? "User" : "Guest"}
        user_name={isSignedIn ? "Taylor" : undefined}
        currency={currency}
        setCurrency={setCurrency}
      />

      <main className="px-4 pb-10 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800"
              >
                <ChevronLeftRoundedIcon fontSize="small" />
                <span>back to room</span>
              </Link>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                Confirm Booking
              </h1>
            </div>

            <button
              type="button"
              onClick={isSignedIn ? handleMockSignOut : handleMockSignIn}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                isSignedIn
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "bg-primary text-white hover:bg-blue-900"
              }`}
            >
              {isSignedIn ? "Mock sign out" : "Mock sign in"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <DropDownTab
              title="1. Sign In"
              isOpen={!isSignedIn && openTab === "signin"}
              isCompleted={isSignedIn}
              onToggle={!isSignedIn ? () => setOpenTab("signin") : undefined}
            >
              {!isSignedIn ? (
                <div className="border-t border-black/8 pt-5">
                  <p className="max-w-2xl text-sm text-slate-600">
                    You must sign in to book a room. Please continue to {''}
                    <a href="#" className="text-primary hover:underline">
                      sign-in page
                    </a>
                  </p>
                </div>
              ) : null}
            </DropDownTab>

            <DropDownTab
              title="2. Booking Summary"
              isOpen={isSignedIn && openTab === "summary"}
              onToggle={isSignedIn ? () => setOpenTab("summary") : undefined}
              isDisabled={!isSignedIn}
            >
              {isSignedIn ? (
                <div className="border-t border-black/8 pt-6">
                  <section>
                    <h3 className="text-xl font-semibold text-slate-950">Room details</h3>
                    <div className="mt-4 rounded-2xl border border-black/8 bg-slate-50 p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                            <HotelRoundedIcon />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-950">The Grand Azure</p>
                            {roomFacts.map((fact) => (
                              <p key={fact} className="text-sm text-slate-500">
                                {fact}
                              </p>
                            ))}
                            <div className="mt-2 flex items-center gap-1 text-sm text-slate-600">
                              <StarRoundedIcon className="text-secondary" fontSize="small" />
                              <span>4.95 (641 reviews)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <LocationOnOutlinedIcon fontSize="small" />
                          <span>Toronto - 100 King Street</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <section>
                      <h3 className="text-xl font-semibold text-slate-950">Booking details</h3>
                      <div className="mt-4 rounded-2xl border border-black/8 bg-white p-5">
                        <div className="space-y-3 text-sm text-slate-700">
                          {bookingRows.map(([label, value]) => (
                            <div
                              key={label}
                              className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <span className="font-semibold text-slate-950">{label}</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-slate-950">Order summary</h3>
                      <div className="mt-4 rounded-2xl border border-black/8 bg-white p-5">
                        <div className="space-y-3 text-sm text-slate-700">
                          {orderRows.map(([label, value]) => (
                            <div key={label} className="flex items-start justify-between gap-4">
                              <span>{label}</span>
                              <span className="text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 border-t border-black/8 pt-4">
                          <div className="flex items-center justify-between text-lg font-bold text-slate-950">
                            <span>Total</span>
                            <span>$675.74</span>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  <button
                    type="button"
                    className="mt-8 rounded-lg bg-gradient-to-r from-primary to-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-muted"
                  >
                    Confirm Booking
                  </button>
                </div>
              ) : null}
            </DropDownTab>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConfirmBookingPage;
