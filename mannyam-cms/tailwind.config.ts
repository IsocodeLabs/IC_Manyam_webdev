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
        olive: "#393e29",
        gold: "#ba8838",
        ivory: "#f6ede3",
        cream: "#fbf7f0",
        paper: "#fffdf9",
      },
      fontFamily: {
        display: ["var(--font-cormorant-garamond)", "serif"],
        sans: ["var(--font-jost)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
