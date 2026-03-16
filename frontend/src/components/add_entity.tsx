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
    setIsActive: (active: boolean) => void;
}

const AddEntity = ({entity, curChainName, curHotelName, setIsActive}: AddEntityProps) => {

    // hotelchain, hotel states 
    const [chainName, setChainName] = useState("");
    const [hotelName, setHotelName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

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

    const formContent = () => {
        switch (entity) {
            case "HotelChain":
                return <>
                    <input 
                        placeholder="Chain Name"
                        value={chainName}
                        onChange={(e) => setChainName(e.target.value)}
                        required
                        className="border px-3 py-2 rounded-lg border-muted text-sm"
                    />
                    <div className="flex items-center border rounded-lg border-muted text-sm">
                        <ApartmentRoundedIcon className="text-muted text-[18px] ml-3"/>
                        <input 
                            placeholder="Central Office Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className="w-full px-2 py-2"
                        />
                    </div>
                    <div className="flex items-center border rounded-lg border-muted text-sm">
                        <EmailRoundedIcon className="text-muted text-[18px] ml-3"/>
                        <input 
                            type="email"
                            placeholder="Central Office Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-2 py-2"
                        />
                    </div>
                    <div className="flex items-center border rounded-lg border-muted text-sm">
                        <CallRoundedIcon className="text-muted text-[18px] ml-3"/>
                        <input 
                            placeholder="Central Office Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="w-full px-2 py-2"
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
                        className="border px-3 py-2 rounded-lg border-muted text-sm"
                    />
                    <div className="flex items-center border rounded-lg border-muted text-sm">
                        <ApartmentRoundedIcon className="text-muted text-[18px] ml-3"/>
                        <input 
                            placeholder="Hotel Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className="w-full px-2 py-2"
                        />
                    </div>
                    <div className="flex items-center border rounded-lg border-muted text-sm">
                        <EmailRoundedIcon className="text-muted text-[18px] ml-3"/>
                        <input 
                            type="email"
                            placeholder="Hotel Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-2 py-2"
                        />
                    </div>
                    <div className="flex items-center border rounded-lg border-muted text-sm">
                        <CallRoundedIcon className="text-muted text-[18px] ml-3 "/>
                        <input 
                            placeholder="Hotel Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="w-full px-2 py-2"
                        />
                    </div>
                </>
            case "Room":
                return <>
                    <input 
                        placeholder="Room Number"
                        value={roomNum}
                        onChange={(e) => setRoomNum(e.target.value)}
                        pattern="^\d*$"
                        required
                        className="border px-3 py-2 rounded-lg border-muted text-sm"
                    />
                    <select
                        value={capacity}
                        required
                        onChange={(e) => setCapacity(e.target.value)}
                        className={`border px-3 py-2 rounded-lg border-muted text-sm ${!capacity ? "text-[#999]" : ""}`}
                    >
                        <option value="" className="text-muted py-2" disabled>
                            Capacity
                        </option>
                        <option value="Single" className="text-black">Single</option>
                        <option value="Double" className="text-black">Double</option>
                        <option value="Suite" className="text-black">Suite</option>
                    </select>
                    <select
                        value={view}
                        required
                        onChange={(e) => setView(e.target.value)}
                        className={`border px-3 py-2 rounded-lg border-muted text-sm ${!view ? "text-[#999]" : ""}`}
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
                        className="border px-3 py-2 rounded-lg border-muted text-sm resize-none"
                    />
                    <textarea 
                        placeholder="Room Problems (optional)"
                        value={problems}
                        onChange={(e) => setProblems(e.target.value)}
                        className="border px-3 py-2 rounded-lg border-muted text-sm resize-none"
                    />
                    <div className="flex justify-between items-center px-3 border rounded-lg border-muted text-sm">
                        <div className="flex items-center">
                            <p>$</p>
                            <input 
                                placeholder="(amount)"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="w-full px-2 py-2"
                            />
                        </div>
                        <p>per night</p>
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
                    <div className="flex items-center border rounded-lg border-muted text-sm">
                        <LocationOnOutlinedIcon className="text-muted ml-3 text-[18px]"/>
                        <input 
                            placeholder="Home Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-2 py-2"
                        />
                    </div>
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        pattern="^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{10,}$"
                        required
                        className="border px-3 py-2 rounded-lg border-muted text-sm"
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
                        className="border px-3 py-2 rounded-lg border-muted text-sm"
                    />
                    <select
                        value={role}
                        required
                        onChange={(e) => setRole(e.target.value)}
                        className={`border px-3 py-2 rounded-lg border-muted text-sm ${!role ? "text-[#999]" : ""}`}
                    >
                        <option value="" className="text-muted py-2" disabled>
                            Select a Role
                        </option>
                        <option value="Employee" className="text-black">Employee</option>
                        <option value="Admin" className="text-black">Admin</option>
                    </select>
                </>
        }
    }

    const handleAddEntity = (e: React.FormEvent) => {
        //add whatever entity logic
    }

    return <div className="bg-white flex flex-col gap-4 max-w-120 p-9 rounded-xl shadow-xl">
        <h2 className="text-lg">{headerText()}</h2>
        <form onSubmit={handleAddEntity} className="flex flex-col gap-2 mt-2">
            {formContent()}
            <div className="flex justify-center gap-4 items-center">
                <button onClick={() => setIsActive(false)} className="flex-1 bg-black/70 text-white px-5 py-3 rounded-lg mt-3 text-sm font-semibold cursor-pointer shadow-md shadow-muted"> CANCEL </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-primary to-blue-900 text-white px-5 py-3 rounded-lg mt-3 text-sm font-semibold cursor-pointer shadow-md shadow-muted"> ADD </button>
            </div>
        </form>
        
    </div>

};

export default AddEntity;