import { useState } from "react";
import { Tab } from "../types/enums";
import LocationIcon from '@mui/icons-material/LocationOnOutlined';

type TabsProps = {
    chain_name: string;
    hotel_name: string;
    address: string;
    active_tab: Tab;
    setActiveTab: (active_tab: Tab) => void;
}

const Tabs = ({ chain_name, hotel_name, address, active_tab, setActiveTab}: TabsProps) => {

  return <div className="flex flex-col items-center">
    <h2 className="text-3xl font-medium">{hotel_name}</h2>
    <h3 className="text-2xl text-primary mt-[-2px]">{chain_name.toUpperCase()}</h3>
    <div className="flex items-center mt-1">
        <LocationIcon className="text-[16px] text-muted mt-0.5 mr-0.5" />
        <p className="text-sm text-muted">{address}</p>
    </div>
    <div className="flex mt-6 text-sm">
        <button 
            onClick={() => setActiveTab("available_rooms")}
            className={`px-4 py-3 ${active_tab === "available_rooms" ? "text-primary border-b-6 border-primary rounded-t" : "text-black/60 border-b-1 border-black/60"}`}
        >
            View Available Rooms
        </button>
        <button 
            onClick={() => setActiveTab("current_bookings")}
            className={`px-4 py-3 ${active_tab === "current_bookings" ? "text-primary border-b-6 border-primary" : "text-black/60 border-b-1 border-black/60"}`}
        >
            View Current Bookings
        </button>
        <button 
            onClick={() => setActiveTab("archived_bookings")}
            className={`px-4 py-3 ${active_tab === "archived_bookings" ? "text-primary border-b-6 border-primary" : "text-black/60 border-b-1 border-black/60"}`}
        >
            View Archived Bookings
        </button>
    </div>
  </div>
};

export default Tabs;