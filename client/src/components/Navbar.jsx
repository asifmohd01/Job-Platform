import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white/5 border-b border-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-lg font-bold text-blue-400">
          JobPortal
        </Link>
        <div className="hidden md:block">
          <input
            placeholder="Search jobs, skills, companies..."
            className="bg-gray-800 text-sm text-gray-200 px-3 py-2 rounded-lg w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-800">🔔</button>

        <div className="relative">
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-800"
          >
            <span className="rounded-full bg-blue-600 w-8 h-8 flex items-center justify-center text-sm">
              {user?.name?.charAt(0) || "U"}
            </span>
            <span className="hidden sm:inline text-sm">
              {user?.name || "User"}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-700 rounded-md shadow-lg w-44">
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-800">
                Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-gray-800"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
