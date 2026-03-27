import { useState } from "react";
import { Link } from "react-router-dom"; 
import { Role } from "../types/enums";

type LoginCardProps = {
  user_type: Role;
}

// using this component for both employee and user login cards, not sure yet if this will mess anything up
const LoginCard = ({user_type}: LoginCardProps) => {

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // LOGIN LOGIC
  }

  return <div className="bg-white flex flex-col gap-4 w-100 p-9 rounded-xl shadow-lg shadow-black/60">
    <h2 className="text-lg">Login</h2>
    <form onSubmit={handleLogin} className="flex flex-col gap-2 mt-2">
      {user_type === "User" && (
        <input 
        type="email"
        placeholder="Email"
        value={id}
        onChange={(e) => setId(e.target.value)}
        required
        className="border px-3 py-2 rounded-lg border-muted text-sm"
      />
      )}
     {user_type === "Employee" && (
        <input 
        placeholder="Employee ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        required
        className="border px-3 py-2 rounded-lg border-muted text-sm"
      />
      )}
      <input 
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border px-3 py-2 rounded-lg border-muted text-sm"
      />
      <button type="submit" className="bg-gradient-to-r from-primary to-blue-900 text-white py-3 rounded-lg mt-3 text-sm font-semibold cursor-pointer shadow-md shadow-muted"> LOGIN </button>
    </form>
    <div className="flex flex-col items-center gap-1">
        {user_type === "User" && (
          <>
            <p className="text-sm text-black/60">Don't have an account? <Link to="/register" className="text-primary font-semibold underline">Register</Link></p> 
            <p className="text-sm text-black/60">Are you an employee? <Link to="/employee/login" className="text-primary font-semibold underline">Login here</Link></p> 
          </>
        )}
        {user_type === "Employee" && (
            <p className="text-sm text-black/60">Not an employee? <Link to="/login" className="text-primary font-semibold underline">Login here</Link></p> 
        )}
    </div>
  </div>

};

export default LoginCard;
