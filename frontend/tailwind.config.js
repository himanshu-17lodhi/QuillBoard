/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          gray: {
            25: '#fdfdfd',
            50: '#f7f7f5',
            100: '#eeeeec',
            200: '#e6e6e3',
            300: '#ddddda',
            400: '#ababab',
            500: '#898989',
            600: '#696969',
            700: '#535353',
            800: '#373737',
            900: '#191919',
          },
          blue: {
            50: '#e7f3ff',
            500: '#2383e2',
            600: '#1f7bd7',
          }
        }
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}