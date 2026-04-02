import { Link } from "react-router-dom";
import logoWhite from "../assets/logo_white.svg";
import { Role } from "../types/enums";

type FooterProps = {
  userType: Role;
};

const Footer = ({ userType }: FooterProps) => {
  return (
    <footer className="mt-16 bg-[#0f265d] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 md:flex-row md:justify-between md:gap-16">
        <div className="max-w-sm">
          <Link to="/" className="inline-block">
            <img src={logoWhite} className="h-7" alt="eHotel logo" />
          </Link>
          <p className="mt-4 text-sm leading-6 text-blue-100">
            Find stays across trusted hotel chains, compare rooms, and manage
            your bookings in one place.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
              Explore
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-blue-50">
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
              <a href="/#browse" className="transition hover:text-white">
                Browse Hotels
              </a>
              <a href="/#city-room-counts" className="transition hover:text-white">
                Rooms by City
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
              Account
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-blue-50">
              {userType === "User" ? (
                <Link to="/bookings" className="transition hover:text-white">
                  My Bookings
                </Link>
              ) : (
                <>
                  <Link to="/login" className="transition hover:text-white">
                    Sign In
                  </Link>
                  <Link to="/register" className="transition hover:text-white">
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-4 text-xs text-blue-200 sm:flex-row sm:items-center sm:justify-between">
          <p>eHotel booking platform</p>
          <p>© 2026 eHotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
