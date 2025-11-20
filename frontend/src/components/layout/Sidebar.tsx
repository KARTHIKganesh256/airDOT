import {
  AlertTriangle,
  BarChart3,
  GaugeCircle,
  Map,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { label: "Dashboard", icon: GaugeCircle, to: "/" },
  { label: "Analytics", icon: BarChart3, to: "/#analytics" },
  { label: "Heatmap", icon: Map, to: "/#heatmap" },
  { label: "Alerts", icon: AlertTriangle, to: "/#alerts" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

const baseClasses =
  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition";

export function Sidebar() {
  return (
    <aside className="hidden h-full w-64 flex-col border-r border-white/5 bg-black/40 p-6 text-white backdrop-blur supports-[backdrop-filter]:bg-black/30 xl:flex">
      <nav className="flex flex-1 flex-col gap-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `${baseClasses} ${
                isActive
                  ? "bg-accent/20 text-accent"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent/20 to-transparent p-4 text-xs text-white/70">
        <p className="font-semibold text-white">Tip</p>
        <p>
          Keep sensors calibrated twice a month to maintain data integrity and
          model accuracy.
        </p>
      </div>
    </aside>
  );
}


