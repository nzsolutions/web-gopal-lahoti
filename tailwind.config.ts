import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0b",
        foreground: "#f4f1ea",
        luxury: {
          bg: "#080809",
          card: "#121214",
          surface: "#18181b",
          border: "rgba(255, 255, 255, 0.08)",
          accent: "#d4af37", // Champagne gold
          bronze: "#c5a880",
          warmWhite: "#f5f2eb",
          charcoal: "#1c1b1f",
          terracotta: "#a35339",
          burgundy: "#4a192c",
          sand: "#e8dfd8"
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cinzel", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-plus-jakarta)", "Syne", "Inter", "sans-serif"],
        display: ["var(--font-cormorant)", "serif"],
      },
      letterSpacing: {
        widestLuxury: "0.25em",
        ultraLuxury: "0.4em",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        }
      },
      animation: {
        fadeIn: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pulseSlow: "pulseSlow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
