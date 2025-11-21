/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3ECF8E',
          100: '#24b47e',
          200: '#3ECF8E', 
          300: '#6ee7b7',
          400: '#a7f3d0',
        },

        sidebar: {
           DEFAULT: '#1C1C1C',
           hover: '#232323',
           border: '#2E2E2E'
        },
        background: {
           DEFAULT: '#111111', 
           layer: '#181818',  
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          1000: '#0D0D0D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}