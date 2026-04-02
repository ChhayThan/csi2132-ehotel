import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../lib/api";
import { useAuth } from "../context/auth_context";

const RegisterCard = () => {
    const navigate = useNavigate();
    const { registerCustomer } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [license, setLicense] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            setIsSubmitting(true);

            await registerCustomer({
                email: email.trim(),
                password,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                drivers_license: license.trim(),
                address: address.trim(),
            });

            navigate("/");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Something went wrong. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return <div className="bg-white flex flex-col gap-4 w-100 p-9 rounded-xl shadow-lg shadow-black/60">
        <h2 className="text-lg">Register</h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-2 mt-2">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border px-3 py-2 rounded-lg border-muted text-sm"
            />
            <input
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="border px-3 py-2 rounded-lg border-muted text-sm"
            />
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
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border px-3 py-2 rounded-lg border-muted text-sm"
            />
            <input 
                placeholder="Driver's License (ex. A0011-22334-55667)"
                value={license}
                onChange={(e) => setLicense(e.target.value.toUpperCase())}
                pattern="^[A-Z]\d{4}-\d{5}-\d{5}$"
                title="Example: A0011-22334-55667"
                required
                className="border px-3 py-2 rounded-lg border-muted text-sm"
            />
            {errorMessage ? <p className="mt-2 text-sm text-red-600">{errorMessage}</p> : null}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-gradient-to-r from-primary to-blue-900 text-white py-3 rounded-lg mt-3 text-sm font-semibold cursor-pointer shadow-md shadow-muted ${
                    isSubmitting ? "opacity-70" : ""
                }`}
            >
                {isSubmitting ? "REGISTERING..." : "REGISTER"}
            </button>
        </form>
        <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-black/60">Already have an account? <Link to="/login" className="text-primary font-semibold underline">Login here</Link></p> 
        </div>
    </div>

};

export default RegisterCard;
