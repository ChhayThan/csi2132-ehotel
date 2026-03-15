import {Link} from "react-router-dom";
import { Role } from "../types/enums";
import logoBlue from "../assets/logo_blue.svg";
import canadaFlag from "../assets/flags/canada_flag.svg";
import usaFlag from "../assets/flags/usa_flag.svg";
import mexicoFlag from "../assets/flags/mexico_flag.svg";
import AccountCircle from '@mui/icons-material/AccountCircleRounded';

type NavbarProps = {
    user_type: Role;
    user_name?: string;
    currency: string;
    setCurrency: (currency: string) => void;
};

const Navbar = ({ user_type, user_name, currency, setCurrency }: NavbarProps) => {
    return <nav className="flex justify-between items-center px-6 py-5 bg-white text-black shadow-sm">
    <Link to="/">
        <img src={logoBlue} className="h-6" alt="eHotel logo"/>
    </Link>
    <div className="flex items-center gap-8">
        {user_type === "Guest" && (
            <>
                <div className="flex items-center">
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="appearance-none px-1 py-1 text-md cursor-pointer"
                    >
                        <option value="CAD">CAD</option>
                        <option value="USD">USD</option>
                        <option value="MXN">MXN</option>
                    </select>
                    {currency === "CAD" && (<img src={canadaFlag} className="h-4" alt="Flag of Canada"/>)}
                    {currency === "USD" && (<img src={usaFlag} className="h-4" alt="USA Flag"/>)}
                    {currency === "MXN" && (<img src={mexicoFlag} className="h-4 ml-1" alt="Flag of Mexico"/>)}
                </div>
                <Link to="/login" className="flex items-center gap-1">
                    <AccountCircle className="text-black"/>
                    <p className="text-md">Sign In</p>
                </Link>
            </>
        )}
        {user_type === "User" && (
            <>
                <div className="flex items-center">
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="appearance-none px-1 py-1 text-md cursor-pointer"
                    >
                        <option value="CAD">CAD</option>
                        <option value="USD">USD</option>
                        <option value="MXN">MXN</option>
                    </select>
                    {currency === "CAD" && (<img src={canadaFlag} className="h-4" alt="Flag of Canada"/>)}
                    {currency === "USD" && (<img src={usaFlag} className="h-4" alt="USA Flag"/>)}
                    {currency === "MXN" && (<img src={mexicoFlag} className="h-4 ml-1" alt="Flag of Mexico"/>)}
                </div>
                <Link to="/bookings">Bookings</Link>
                <button className="flex items-center gap-1 cursor-pointer">
                    <AccountCircle className="text-black"/>
                    <p className="text-md">{user_name}</p>
                </button>
            </>
        )}
        {user_type === "Employee" && (
                <button className="flex items-center gap-1 cursor-pointer">
                    <AccountCircle className="text-black"/>
                    <p className="text-md">{user_name}</p>
                </button>
        )}
        {user_type === "Admin" && (
            <>
                <Link to="/bookings">Manage Database</Link>
                <button className="flex items-center gap-1 cursor-pointer">
                    <AccountCircle className="text-black"/>
                    <p className="text-md">{user_name}</p>
                </button>
            </>
        )}
    </div>
  </nav>
};

export default Navbar;