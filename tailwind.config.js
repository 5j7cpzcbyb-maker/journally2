/** @type {import('tailwindcss').Config} */
module.exports = {
  // This line tells Tailwind to look for the "dark" class on the <html> tag
  darkMode: 'class', 
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // You can define your brand colors here for easier use later
        brand: '#3E7C7D',
        accent: '#D45D21',
      }
    },
  },
  plugins: [],
}
