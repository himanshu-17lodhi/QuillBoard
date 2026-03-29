import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f4ee",
          100: "#ede5d8",
          200: "#dcccad",
          300: "#c9b187",
          400: "#b0925e",
          500: "#987645",
          600: "#7b5c34",
          700: "#61482c",
          800: "#43311f",
          900: "#281d13"
        }
      },
      boxShadow: {
        panel: "0 18px 40px rgba(37, 26, 17, 0.14)"
      },
      backgroundImage: {
        "paper-grid":
          "linear-gradient(rgba(94, 73, 46, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(94, 73, 46, 0.05) 1px, transparent 1px)"
      },
      backgroundSize: {
        grid: "24px 24px"
      },
      keyframes: {
        "fade-slide": {
          "0%": {
            opacity: "0",
            transform: "translateY(8px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        }
      },
      animation: {
        "fade-slide": "fade-slide 320ms ease-out"
      }
    }
  },
  plugins: []
};

export default config;

