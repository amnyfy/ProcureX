import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  FileText,
  UserRound,
  LogOut,
  Radar,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/tenders", label: "Tenders", icon: FileText },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function Sidebar({ onNavigate }) {
  const { logout, user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-brand-950 text-brand-100">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700">
          <Radar size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display text-base font-bold leading-tight text-white">
            ProcureX
          </p>
          <p className="text-[11px] uppercase tracking-wider text-brand-300">
            Tender Intelligence
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-800 text-white"
                  : "text-brand-200 hover:bg-brand-900 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-brand-800 px-3 py-4">
        {user && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
              {(user.full_name || user.email || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user.full_name || user.email}
              </p>
              {user.role && (
                <p className="truncate text-xs text-brand-300">{user.role}</p>
              )}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-200 transition-colors hover:bg-brand-900 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
