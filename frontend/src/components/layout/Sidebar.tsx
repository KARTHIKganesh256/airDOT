import {
  AlertTriangle,
  BarChart3,
  GaugeCircle,
  Map,
  Settings,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { label: "Dashboard", icon: GaugeCircle, to: "/", hash: null },
  { label: "Analytics", icon: BarChart3, to: "/", hash: "analytics" },
  { label: "Heatmap", icon: Map, to: "/", hash: "heatmap" },
  { label: "Alerts", icon: AlertTriangle, to: "/", hash: "alerts" },
  { label: "Settings", icon: Settings, to: "/settings", hash: null },
];

const baseClasses =
  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition cursor-pointer";

export function Sidebar() {
  const navigate = useNavigate();

  const handleNavClick = (to: string, hash: string | null) => {
    if (hash) {
      // Navigate to the page first
      navigate(to);
      // Then scroll to the section after a brief delay to ensure the page is rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      navigate(to);
    }
  };

  return (
    <aside className="hidden h-full w-64 flex-col border-r border-white/5 bg-black/40 p-6 text-white backdrop-blur supports-[backdrop-filter]:bg-black/30 xl:flex">
      <nav className="flex flex-1 flex-col gap-3">
        {links.map((link) => (
          <div
            key={link.label}
            onClick={() => handleNavClick(link.to, link.hash)}
            className={`${baseClasses} ${
              link.hash
                ? "text-white/70 hover:bg-white/5 hover:text-white"
                : ""
            }`}
          >
            {link.hash ? (
              <>
                <link.icon size={18} />
                {link.label}
              </>
            ) : (
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 ${
                    isActive
                      ? "text-accent"
                      : "text-white/70 hover:text-white"
                  }`
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            )}
          </div>
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


