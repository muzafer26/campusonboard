import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { dark: "#0B1D3A", DEFAULT: "#0B1D3A" },
        brand: { blue: "#1A56DB", light: "#3B82F6", pale: "#DBEAFE" },
        accent: { amber: "#F59E0B" },
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F97316",
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "serif"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;