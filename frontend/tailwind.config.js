/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom fleet colors (optional, but good for branding)
        primary: "#3B82F6", // Blue
        secondary: "#64748B", // Slate
        danger: "#EF4444", // Red
        success: "#22C55E", // Green
        warning: "#F59E0B", // Amber
        dark: "#1E293B", // Slate-800
      },
    },
  },
  plugins: [],
}