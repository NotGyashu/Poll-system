/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7765DA',
        secondary: '#5767D0',
        accent: '#4F0DCE',
        'bg-light': '#F2F2F2',
        'text-dark': '#373737',
        'text-gray': '#6E6E6E',
        'timer-red': '#DC2626',
      },
    },
  },
  plugins: [],
}
