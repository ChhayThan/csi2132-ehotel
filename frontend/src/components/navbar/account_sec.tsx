/* account section subcomponent for navbar */
import { useState, useEffect } from "react";
import AccountCircle from '@mui/icons-material/AccountCircleRounded';

type AccountSecProps = {
    user_name?: string;
    handleSignOut: () => void;
}

const AccountSec = ({ user_name, handleSignOut }: AccountSecProps) => {

    const [modalOpen, setModalOpen] = useState(false);

    // close sign out modal when click anywhere else
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest("#account")) {
                setModalOpen(false);
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick)
    }, []);

    return <div id="account" className="relative">
            {/* toggle modal on click */}
            <button 
                onClick={() => setModalOpen(!modalOpen)}
                className="flex items-center gap-1 cursor-pointer"
            >
                <AccountCircle className="text-black"/>
                <p className="text-md">{user_name}</p>
            </button>
            {/* modal */}
            {modalOpen && (
                <div className="absolute right-0 mt-3 px-4 py-4 bg-white border border-muted rounded">
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handleSignOut()} className="text-sm whitespace-nowrap cursor-pointer">Sign Out</button>
                    </div>
                </div>
            )}
        </div>
}

export default AccountSec;