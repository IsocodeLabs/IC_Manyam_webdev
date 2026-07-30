import type { Config } from "tailwindcss";

// Custom colour configuration matching the MANNYAM Studio design system
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: "#393e29",
        "olive-2": "#31351f",
        gold: "#ba8838",
        "gold-deep": "#8a6320",
        sand: "#c39657",
        "sand-soft": "#d8c19a",
        ivory: "#f6ede3",
        cream: "#fbf7f0",
        paper: "#fffdf9",
        ink: "#2c3120",
        bg: "#eee7da",
        ok: "#3f7d4e",
        warn: "#c08a2b",
        bad: "#b4552f",
        info: "#3a6ea5",
      },
      fontFamily: {
        display: ["var(--font-cormorant-garamond)", "Georgia", "serif"],
        sans: ["var(--font-jost)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderColor: {
        line: "rgba(57, 62, 41, 0.16)",
        "line-2": "rgba(57, 62, 41, 0.09)",
        "line-gold": "rgba(186, 136, 56, 0.5)",
      },
      boxShadow: {
        panel: "0 20px 50px -26px rgba(44, 49, 32, 0.5)",
        sm: "0 6px 18px -10px rgba(44, 49, 32, 0.4)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out forwards",
        "toast-in": "toast-in 0.25s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
