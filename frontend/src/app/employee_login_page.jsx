import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoWhite from "../assets/logo_white.svg";

function EmployeeLoginPage() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/employee/dashboard");
  };

  const canSubmit = employeeId.trim() !== "" && password.trim() !== "";

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
        <section className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(38,84,187,0.24),transparent_36%),linear-gradient(135deg,rgba(7,10,22,0.96),rgba(8,13,30,0.86))] lg:block">
          <img src={logoWhite} alt="eHotel logo" className="absolute left-8 top-8 h-7" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,7,17,0.35),rgba(4,7,17,0.05))]" />
          <div className="absolute bottom-12 left-10 max-w-md text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-white/60">
              Employee Portal
            </p>
            <h1 className="mt-4 text-5xl font-light leading-tight">
              Manage bookings and room rentals in one place.
            </h1>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-[1.75rem] border border-black/8 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:p-10">
            <h2 className="text-2xl font-semibold text-slate-950">Employee Login</h2>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <input
                type="text"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                placeholder="Employee ID"
                className="rounded-xl border border-black/12 px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="rounded-xl border border-black/12 px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
              <button
                type="submit"
                disabled={!canSubmit}
                className={`mt-2 rounded-lg py-3 text-sm font-semibold shadow-md ${
                  canSubmit
                    ? "bg-gradient-to-r from-primary to-blue-900 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                Login
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Not an employee?{" "}
              <Link to="/" className="font-semibold text-primary underline">
                Login here
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default EmployeeLoginPage;
