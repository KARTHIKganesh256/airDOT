import { Moon, Sun } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.18]"
    >
      {isDark ? (
        <>
          <Sun size={16} /> Light
        </>
      ) : (
        <>
          <Moon size={16} /> Dark
        </>
      )}
    </button>
  );
}


