/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // 1. This line fixes your issue by checking the root pages folder
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    
    // 2. This checks the src folder (where your styles and stores are)
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
           DEFAULT: '#00D084', 
           dark: '#0F2634',  
           light: '#1A3C4D',
        }
      }
    },
  },
  plugins: [],
}