import { useState } from "react";

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

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [inputEmail, setInputEmail] = useState("");
    const [numGuests, setNumGuests] = useState("");
    const [checkoutDate, setCheckoutDate] = useState("");

    const handleRent = (e: React.FormEvent) => {
        if (is_booked) {
            // use info passed into this modal
        } else {
            // use info from input of modal
        }
        // rent logic
    }

    return <div className="bg-white flex flex-col gap-4 max-w-120 p-9 rounded-xl shadow-xl">
        <h2 className="text-lg">Renting <strong>Room {room_num}</strong> to {is_booked ? name : "a Customer"}</h2>
        {!is_booked ? (
        <form onSubmit={handleRent} className="flex flex-col gap-2 mt-2">
            <div className="flex">
                <input 
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="border px-3 py-2 rounded-l-lg border-muted text-sm w-[50%]"
                />
                <input 
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="border px-3 py-2 rounded-r-lg border-muted border-l-0 text-sm w-[50%]"
                />
            </div>
            <input 
                type="email"
                placeholder="Email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                required
                className="border px-3 py-2 rounded-lg border-muted text-sm"
            />
            <input 
                placeholder="# of Guests"
                value={numGuests}
                onChange={(e) => setNumGuests(e.target.value)}
                required
                className="border px-3 py-2 rounded-lg border-muted text-sm"
            />
            <input 
                type="date"
                placeholder="Check-out date"
                value={checkoutDate}
                onChange={(e) => setCheckoutDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                className="border px-3 py-2 rounded-lg border-muted text-sm"
            />
            <div className="flex justify-center gap-4 items-center">
                <button onClick={() => setIsActive(false)} className="flex-1 bg-black/70 text-white px-5 py-3 rounded-lg mt-3 text-sm font-semibold cursor-pointer shadow-md shadow-muted"> CANCEL </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-primary to-blue-900 text-white px-5 py-3 rounded-lg mt-3 text-sm font-semibold cursor-pointer shadow-md shadow-muted"> RENT </button>
            </div>
        </form>
        ) : (
            <div className="flex justify-center gap-4 items-center">
                <button onClick={() => setIsActive(false)} className="flex-1 bg-black/70 text-white px-5 py-3 rounded-lg mt-3 text-sm font-semibold cursor-pointer shadow-md shadow-muted"> CANCEL </button>
                <button onClick={handleRent} className="flex-1 bg-gradient-to-r from-primary to-blue-900 text-white px-5 py-3 rounded-lg mt-3 text-sm font-semibold cursor-pointer shadow-md shadow-muted"> RENT </button>
            </div>
        )}
    </div>

};

export default RentModal;