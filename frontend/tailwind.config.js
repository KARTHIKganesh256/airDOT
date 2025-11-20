/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0f0f10",
          light: "#f5f5f5",
          dark: "#050507",
        },
        accent: {
          DEFAULT: "#00e0ff",
          subtle: "#60f0ff",
        },
        aqi: {
          green: "#00e400",
          yellow: "#ffff00",
          orange: "#ff7e00",
          red: "#ff0000",
          purple: "#8f3f97",
          maroon: "#7e0023",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 40px -24px rgba(0, 224, 255, 0.35)",
      },
    },
  },
  plugins: [],
};

