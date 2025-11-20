import { Wifi, Wind } from "lucide-react";
import { Link } from "react-router-dom";

import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-black/20 px-8 py-4 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="flex items-center gap-3 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/40 text-accent">
          <Wind />
        </div>
        <div>
          <Link to="/" className="text-xl font-semibold text-white">
            AeroSense
          </Link>
          <p className="text-xs text-white/60">
            Real-time AI air quality intelligence
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 md:flex">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Connected
          <Wifi size={16} />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}


