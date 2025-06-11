import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#FF5555",
        secondary: "#E14C4C",
        tertiary: "#422B2B",
        highlight: "#FAFAFA",
        accent: "#EEA3A3",
        bg: "#ECE6E6",
      },
    },
    screens: {
      xx: "200px",
      xs: "400px",
      ss: "490px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
} satisfies Config;
