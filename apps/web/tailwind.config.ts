import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F17",
        card: "#0F172A",
        border: "#1E293B",
        accent: {
          DEFAULT: "#22D3EE",
          teal: "#14B8A6"
        }
      }
    }
  },
  plugins: []
};

export default config;

