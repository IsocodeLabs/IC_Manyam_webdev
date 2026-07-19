import type { Config } from "tailwindcss";

// Custom colour configuration matching the design system
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: "#3a4430",
        gold: "#b1832f",
        ivory: "#fcfcfa",
        cream: "#f4f3ec",
        paper: "#fffdf9",
        ink: "#22271d",
        sand: "#c39657",
      },
      fontFamily: {
        display: ["var(--font-cormorant-garamond)", "serif"],
        sans: ["var(--font-jost)", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
