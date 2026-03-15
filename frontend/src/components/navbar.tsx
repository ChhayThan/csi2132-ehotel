import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

    const [signOutModal, setSignOutModal] = useState(false);

    // add when sign in/sign out logic is added
    const handleSignOut = () => {
        setSignOutModal(false);
        // SIGN OUT LOGIC
    }

    // close sign out modal when click anywhere else
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest("#account")) {
                setSignOutModal(false);
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick)
    }, []);
    
    return <nav className="flex justify-between items-center px-6 py-5 bg-white text-black shadow-sm">
        {/* logo */}
        <Link to="/">
            <img src={logoBlue} className="h-6" alt="eHotel logo"/>
        </Link>

        {/* right side stuff */}
        <div className="flex items-center gap-8">
            {user_type === "Guest" && (
                <>
                    {/* currency dropdown */}
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
                    {/* currency dropdown */}
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

                    <div id="account" className="relative">
                        {/* sign out modal on click */}
                        <button 
                            onClick={() => setSignOutModal(!signOutModal)}
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <AccountCircle className="text-black"/>
                            <p className="text-md">{user_name}</p>
                        </button>
                        {/* sign out modal */}
                        {signOutModal && (
                            <div className="absolute right-0 mt-3 px-4 py-4 bg-white border border-muted rounded">
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => handleSignOut()} className="text-sm whitespace-nowrap cursor-pointer">Sign Out</button>
                                </div>
                            </div>
                        )}
                    </div>

                </>
            )}
            {user_type === "Employee" && (
                    <div id="account" className="relative">
                        {/* sign out modal on click */}
                        <button 
                            onClick={() => setSignOutModal(!signOutModal)}
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <AccountCircle className="text-black"/>
                            <p className="text-md">{user_name}</p>
                        </button>
                        {/* sign out modal */}
                        {signOutModal && (
                            <div className="absolute right-0 mt-3 px-4 py-4 bg-white border border-muted rounded">
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => handleSignOut()} className="text-sm whitespace-nowrap cursor-pointer">Sign Out</button>
                                </div>
                            </div>
                        )}
                    </div>
            )}
            {user_type === "Admin" && (
                <>
                    <Link to="/bookings">Manage Database</Link>

                    <div id="account" className="relative">
                        {/* sign out modal on click */}
                        <button 
                            onClick={() => setSignOutModal(!signOutModal)}
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <AccountCircle className="text-black"/>
                            <p className="text-md">{user_name}</p>
                        </button>
                        {/* sign out modal */}
                        {signOutModal && (
                            <div className="absolute right-0 mt-3 px-4 py-4 bg-white border border-muted rounded">
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => handleSignOut()} className="text-sm whitespace-nowrap cursor-pointer">Sign Out</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    </nav>
};

export default Navbar;