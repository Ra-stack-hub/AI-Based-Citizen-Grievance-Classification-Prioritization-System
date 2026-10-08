/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        surfaceLight: "#F1F5F9",
        primary: "#1E3A8A",
        secondary: "#EA580C",
        accent: "#15803D",
        danger: "#DC2626",
        warning: "#D97706",
        success: "#16A34A",
        textPrimary: "#0F172A",
        textSecondary: "#475569",
        borderLight: "#E2E8F0"
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
}
