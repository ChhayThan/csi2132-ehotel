import { useState } from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

type RentModalProps = {
    is_booked: boolean;
    room_num: number;
    name?: string;
    email?: string;
    num_guests?: number;
    subtotal: number;
    total: number;
    setIsActive: (active: boolean) => void;
}

const RentModal = ({ is_booked, room_num, name, email, num_guests, subtotal, total, setIsActive}: RentModalProps) => {
    const inputClass = "w-full rounded-2xl border border-black/30 px-5 py-4 text-sm outline-none";

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [inputEmail, setInputEmail] = useState("");
    const [numGuests, setNumGuests] = useState("");
    const [checkoutDate, setCheckoutDate] = useState("");

    const handleRent = (e: React.FormEvent) => {
        e.preventDefault();
        if (is_booked) {
            // use info passed into this modal
        } else {
            // use info from input of modal
        }
        // rent logic
        setIsActive(false);
    }

    return <div className="bg-white flex w-full max-w-[35rem] flex-col gap-6 rounded-[2rem] p-8 shadow-[0_8px_25px_rgba(0,0,0,0.28)] sm:p-10">
        <h2 className="text-3xl text-slate-950">Renting <strong>Room {room_num}</strong> to {is_booked ? name : "a Customer"}</h2>
        {!is_booked ? (
        <form onSubmit={handleRent} className="flex flex-col gap-4">
            <div className="flex">
                <input 
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-[50%] rounded-l-2xl border border-black/30 px-5 py-4 text-sm outline-none"
                />
                <input 
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-[50%] rounded-r-2xl border border-l-0 border-black/30 px-5 py-4 text-sm outline-none"
                />
            </div>
            <input 
                type="email"
                placeholder="Email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                required
                className={inputClass}
            />
            <input 
                placeholder="# of Guests"
                value={numGuests}
                onChange={(e) => setNumGuests(e.target.value)}
                required
                className={inputClass}
            />
            <label className="flex items-center gap-3 rounded-2xl border border-black/30 px-5 py-4 text-sm">
                <CalendarMonthOutlinedIcon className="text-black/55" />
                <input 
                    type="date"
                    placeholder="Check-out date"
                    value={checkoutDate}
                    onChange={(e) => setCheckoutDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full outline-none"
                />
            </label>
            <div className="mt-3 space-y-1 text-slate-700">
                <p>Subtotal: ${subtotal.toFixed(2)}</p>
                <p className="text-4xl font-bold text-slate-950">Total: ${total.toFixed(2)}</p>
            </div>
            <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
                <button type="button" onClick={() => setIsActive(false)} className="cursor-pointer rounded-2xl bg-black/65 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"> CANCEL </button>
                <button type="submit" className="cursor-pointer rounded-2xl bg-gradient-to-r from-primary to-blue-900 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"> RENT </button>
            </div>
        </form>
        ) : (
            <form onSubmit={handleRent} className="flex flex-col gap-4">
                <div className="mt-3 space-y-1 text-slate-700">
                    <p>Subtotal: ${subtotal.toFixed(2)}</p>
                    <p className="text-4xl font-bold text-slate-950">Total: ${total.toFixed(2)}</p>
                </div>
                <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
                    <button type="button" onClick={() => setIsActive(false)} className="cursor-pointer rounded-2xl bg-black/65 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"> CANCEL </button>
                    <button type="submit" className="cursor-pointer rounded-2xl bg-gradient-to-r from-primary to-blue-900 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"> RENT </button>
                </div>
            </form>
        )}
    </div>

};

export default RentModal;
