import { Link } from "react-router-dom";
import { Role } from "../../types/enums";
import logoBlue from "../../assets/logo_blue.svg";
import "../../types/svg.d.ts"
import AccountCircle from '@mui/icons-material/AccountCircleRounded';
import CurrencySelector from "./currency_selector.tsx";
import AccountSec from "./account_sec.tsx";

type NavbarProps = {
    user_type: Role;
    user_name?: string;
    currency: string;
    setCurrency: (currency: string) => void;
};

const Navbar = ({ user_type, user_name, currency, setCurrency }: NavbarProps) => {

    const handleSignOut = () => {
        // SIGN OUT LOGIC
    }
    
    return <nav className="fixed top-0 left-0 z-50 w-full flex justify-between items-center px-6 py-5 bg-white text-black shadow-sm">
        {/* logo */}
        <Link to="/">
            <img src={logoBlue} className="h-6" alt="eHotel logo"/>
        </Link>

        {/* right side stuff */}
        <div className="flex items-center gap-8">
            {user_type === "Guest" && (
                <>
                    <CurrencySelector currency={currency} setCurrency={setCurrency} />
                    <Link to="/login" className="flex items-center gap-1">
                        <AccountCircle className="text-black"/>
                        <p className="text-md">Sign In</p>
                    </Link>
                </>
            )}
            {user_type === "User" && (
                <>
                    <CurrencySelector currency={currency} setCurrency={setCurrency} />
                    <Link to="/bookings">Bookings</Link>
                    <AccountSec user_name={user_name} handleSignOut={handleSignOut} />
                </>
            )}
            {user_type === "Employee" && (
                <AccountSec user_name={user_name} handleSignOut={handleSignOut} />
            )}
            {user_type === "Admin" && (
                <>
                    <Link to="/admin/manage-database">Manage Database</Link>
                    <AccountSec user_name={user_name} handleSignOut={handleSignOut} />
                </>
            )}
        </div>
    </nav>
};

export default Navbar;
