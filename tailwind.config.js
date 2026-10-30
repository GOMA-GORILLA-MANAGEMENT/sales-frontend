/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: { max: "480px" },
      },
      colors: {
        primary: {
          50: "#efeaff",
          100: "#e0d9ff",
          200: "#c1b5ff",
          300: "#a391ff",
          400: "#846cff",
          500: "#FF6F00",
          600: "#5f40e0",
          700: "#4e34bd",
          800: "#3e2a96",
          900: "#2e206f",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Lexend", "sans-serif"],
        zed: ['"Zen Dots"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
