/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'DM Sans', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        uberBlack: "#000000",
        pureWhite: "#ffffff",
        hoverGray: "#e2e2e2",
        hoverLight: "#f3f3f3",
        chipGray: "#efefef",
        bodyGray: "#4b4b4b",
        mutedGray: "#afafaf",
        borderBlack: "#000000",
      },
      boxShadow: {
        'level-1': '0px 4px 16px rgba(0, 0, 0, 0.12)',
        'level-2': '0px 4px 16px rgba(0, 0, 0, 0.16)',
        'level-3': '0px 2px 8px rgba(0, 0, 0, 0.16)',
        'pressed': 'inset 0px 4px 8px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'pill': '9999px',
        'standard': '8px',
        'featured': '12px',
        'circle': '50%',
      }
    },
  },
  plugins: [],
}