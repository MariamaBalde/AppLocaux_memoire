/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E67E22',
          dark: '#D35400',
          light: '#F39C12',
        },
        secondary: {
          DEFAULT: '#8B4513',
          dark: '#6B3410',
          light: '#A0522D',
        },
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
        info: '#3498DB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
