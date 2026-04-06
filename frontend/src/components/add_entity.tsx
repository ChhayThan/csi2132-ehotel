import { useState } from "react";
import { DbEntity } from "../types/enums";

import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

type AddEntityProps = {
    entity: DbEntity;
    curChainName?: string;
    curHotelName?: string
    onCreate: (values: Record<string, any>) => void;
    setIsActive: (active: boolean) => void;
}

const AddEntity = ({entity, curChainName, curHotelName, setIsActive, onCreate}: AddEntityProps) => {
    const inputClass = "w-full rounded-2xl border border-black/30 px-5 py-4 text-sm outline-none";
    const iconWrapClass = "flex items-center rounded-2xl border border-black/30 text-sm";

    // hotelchain, hotel states 
    const [chainName, setChainName] = useState("");
    const [hotelName, setHotelName] = useState("");
    const [address, setAddress] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [managerId, setManagerId] = useState("");

    // employee states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [license, setLicense] = useState("");
    const [role, setRole] = useState("");

    // room states
    const [roomNum, setRoomNum] = useState("");
    const [capacity, setCapacity] = useState("");
    const [view, setView] = useState("");
    const [amenities, setAmenities] = useState("");
    const [problems, setProblems] = useState("");
    const [price, setPrice] = useState("");

    const headerText = () => {
        switch (entity) {
            case "HotelChain":
                return "Add a Hotel Chain"
            case "Hotel":
                return `Add a Hotel to ${curChainName}`
            case "Room":
                return `Add a Room to ${curHotelName}`
            default:
                return `Add an Employee to ${curHotelName}`
        }
    }

    const getValues = () => {
        switch (entity) {
            case "HotelChain":
                return { name: chainName, address, email, phone: phoneNumber };
            case "Hotel":
                return { name: hotelName, streetAddress, city, country , email, phone: phoneNumber, managerId };
            case "Room":
                return { roomNumber: roomNum, capacity, view, amenities, problems, price };
            default:
                return { firstName, lastName, address: email, password, role }; 
        }
    };

    const formContent = () => {
        switch (entity) {
            case "HotelChain":
                return <>
                    <input 
                        placeholder="Chain Name"
                        value={chainName}
                        onChange={(e) => setChainName(e.target.value)}
                        required
                        className={inputClass}
                    />
                    <div className={iconWrapClass}>
                        <ApartmentRoundedIcon className="ml-4 text-[1.35rem] text-black/55"/>
                        <input 
                            placeholder="Central Office Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className="w-full px-3 py-4 outline-none"
                        />
                    </div>
                    <div className={iconWrapClass}>
                        <EmailRoundedIcon className="ml-4 text-[1.35rem] text-black/55"/>
                        <input 
                            type="email"
                            placeholder="Central Office Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-4 outline-none"
                        />
                    </div>
                    <div className={iconWrapClass}>
                        <CallRoundedIcon className="ml-4 text-[1.35rem] text-black/55"/>
                        <input 
                            placeholder="Central Office Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="w-full px-3 py-4 outline-none"
                        />
                    </div>
                </>
            case "Hotel":
                return <>
                    <input 
                        placeholder="Hotel Name"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        required
                        className={inputClass}
                    />
                    <div className={iconWrapClass}>
                        <ApartmentRoundedIcon className="ml-4 text-[1.35rem] text-black/55"/>
                        <input 
                            placeholder="Street Address"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            required
                            className="w-full px-3 py-4 outline-none"
                        />
                    </div>
                    <input 
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className={inputClass}
                    />
                    <input 
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className={inputClass}
                    />
                    <div className={iconWrapClass}>
                        <EmailRoundedIcon className="ml-4 text-[1.35rem] text-black/55"/>
                        <input 
                            type="email"
                            placeholder="Hotel Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-4 outline-none"
                        />
                    </div>
                    <div className={iconWrapClass}>
                        <CallRoundedIcon className="ml-4 text-[1.35rem] text-black/55"/>
                        <input 
                            placeholder="Hotel Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="w-full px-3 py-4 outline-none"
                        />
                    </div>
                    <input 
                        placeholder="Add Manager ID"
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                        required
                        className={inputClass}
                    />
                </>
            case "Room":
                return <>
                    <input 
                        placeholder="Room Number"
                        value={roomNum}
                        onChange={(e) => setRoomNum(e.target.value)}
                        pattern="^\d*$"
                        required
                        className={inputClass}
                    />
                    <select
                        value={capacity}
                        required
                        onChange={(e) => setCapacity(e.target.value)}
                        className={`${inputClass} appearance-none bg-white ${!capacity ? "text-black/45" : ""}`}
                    >
                        <option value="" className="text-muted py-2" disabled>
                            Capacity
                        </option>
                        <option value="1" className="text-black">Single</option>
                        <option value="2" className="text-black">Double</option>
                        <option value="4" className="text-black">Suite</option>
                    </select>
                    <select
                        value={view}
                        required
                        onChange={(e) => setView(e.target.value)}
                        className={`${inputClass} appearance-none bg-white ${!view ? "text-black/45" : ""}`}
                    >
                        <option value="" className="text-muted py-2" disabled>
                            View
                        </option>
                        <option value="" className="text-black">None</option>
                        <option value="City" className="text-black">City</option>
                        <option value="Ocean" className="text-black">Ocean</option>
                        <option value="Mountain" className="text-black">Mountain</option>
                    </select>
                    <textarea 
                        placeholder={`Amenities (comma separated)\ni.e. Air Conditioning, TV, WiFi, etc. `}
                        value={amenities}
                        onChange={(e) => setAmenities(e.target.value)}
                        required
                        className={`${inputClass} min-h-28 resize-none`}
                    />
                    <textarea 
                        placeholder="Room Problems (optional)"
                        value={problems}
                        onChange={(e) => setProblems(e.target.value)}
                        className={`${inputClass} min-h-24 resize-none`}
                    />
                    <div className="flex items-center justify-between rounded-2xl border border-black/30 px-5 py-4 text-sm">
                        <div className="flex items-center">
                            <p className="font-semibold">$</p>
                            <input 
                                placeholder="(amount)"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="w-full px-2 outline-none"
                            />
                        </div>
                        <p className="font-semibold">per night</p>
                    </div>
                </>
            default:
                return <>
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
                    <div className={iconWrapClass}>
                        <LocationOnOutlinedIcon className="ml-4 text-[1.35rem] text-black/55"/>
                        <input 
                            placeholder="Home Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-4 outline-none"
                        />
                    </div>
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        pattern="^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{10,}$"
                        required
                        className={inputClass}
                    />
                    <div className="text-xs mb-2">
                        <p>Requires:</p>
                        <ul className="text-muted list-disc pl-8">
                            <li>at least 10 characters</li>
                            <li>at least 1 number</li>
                            <li>at least 1 symbol</li>
                        </ul>
                    </div>
                    <input 
                        placeholder="Driver's License (ex. A0011-22334-55667)"
                        value={license}
                        onChange={(e) => setLicense(e.target.value.toUpperCase())}
                        pattern="^[A-Z]\d{4}-\d{5}-\d{5}$"
                        title="Example: A0011-22334-55667"
                        required
                        className={inputClass}
                    />
                    <select
                        value={role}
                        required
                        onChange={(e) => setRole(e.target.value)}
                        className={`${inputClass} appearance-none bg-white ${!role ? "text-black/45" : ""}`}
                    >
                        <option value="" className="text-muted py-2" disabled>
                            Select a Role
                        </option>
                        <option value="regular" className="text-black">Employee</option>
                        <option value="admin" className="text-black">Admin</option>
                    </select>
                </>
        }
    }

    return <div className="bg-white flex w-full max-w-[52rem] flex-col gap-6 rounded-[2rem] p-8 shadow-[0_8px_25px_rgba(0,0,0,0.28)] sm:p-10">
        <h2 className="text-3xl text-slate-950">{headerText()}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onCreate(getValues()); }} className="flex flex-col gap-4">
            {formContent()}
            <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
                <button type="button" onClick={() => setIsActive(false)} className="cursor-pointer rounded-2xl bg-black/65 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"> CANCEL </button>
                <button type="submit" className="cursor-pointer rounded-2xl bg-gradient-to-r from-primary to-blue-900 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"> ADD </button>
            </div>
        </form>
        
    </div>
};

export default AddEntity;
