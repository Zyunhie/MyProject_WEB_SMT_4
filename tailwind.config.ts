import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  variants: {
    extend: {
      display: ["print"],
      boxShadow: ["print"],
      borderRadius: ["print"],
      padding: ["print"],
      backgroundColor: ["print"],
      textColor: ["print"],
    },
  },
  plugins: [],
};

export default config;
