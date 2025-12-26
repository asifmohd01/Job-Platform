import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiSearch,
  FiUser,
  FiUsers,
  FiBriefcase,
  FiPlusSquare,
  FiFileText,
  FiMenu,
} from "react-icons/fi";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const common = [
    { to: "/", label: "Home", icon: FiHome },
    { to: "/jobs", label: "Browse Jobs", icon: FiSearch },
  ];

  const candidate = [
    { to: "/candidate-dashboard", label: "Dashboard", icon: FiHome },
    { to: "/candidate-dashboard/my-applications", label: "My Applications", icon: FiFileText },
    { to: "/saved", label: "Saved Jobs", icon: FiBriefcase },
    { to: "/profile", label: "Profile", icon: FiUser },
  ];

  const recruiter = [
    { to: "/recruiter-dashboard", label: "Dashboard", icon: FiHome },
    { to: "/recruiter-dashboard/post-job", label: "Post Job", icon: FiPlusSquare },
    { to: "/recruiter-dashboard/my-jobs", label: "My Jobs", icon: FiBriefcase },
  ];

  const admin = [
    { to: "/admin-dashboard", label: "Dashboard", icon: FiHome },
    { to: "/admin-dashboard/users", label: "Users", icon: FiUsers },
    { to: "/admin-dashboard/jobs", label: "Jobs", icon: FiBriefcase },
  ];

  const items = [
    ...common,
    ...(user?.role === "recruiter" ? recruiter : user?.role === "admin" ? admin : candidate),
  ];

  const isActive = (to) => {
    try {
      return location.pathname === to || location.pathname.startsWith(to + "/");
    } catch (e) {
      return false;
    }
  };

  return (
    <aside
      className={`bg-gray-900 border-r border-gray-800 min-h-screen hidden md:block transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-3 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center w-full" : ""}`}>
            <div className="text-blue-400 font-bold text-lg">JP</div>
            {!collapsed && <div className="text-sm text-gray-300">Welcome</div>}
          </div>

          <button
            onClick={() => setCollapsed((s) => !s)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-md hover:bg-gray-800 text-gray-200"
          >
            <FiMenu size={18} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {items.map((it) => {
            const Icon = it.icon || FiHome;
            const active = isActive(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                title={it.label}
                className={`flex items-center gap-3 ${
                  collapsed ? "justify-center" : "px-3"
                } py-2 rounded-lg transition-colors duration-150 ${
                  active
                    ? "bg-gray-800 text-blue-300"
                    : "text-gray-200 hover:bg-gray-800"
                }`}
                style={{ margin: 0 }}
              >
                <Icon className={`flex-shrink-0 ${active ? "text-blue-300" : "text-gray-300"}`} />
                {!collapsed && <span className="text-sm">{it.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* footer spacer / optional actions could go here */}
      </div>
    </aside>
  );
}
