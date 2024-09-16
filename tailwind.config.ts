import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0052FF', // Coinbase blue
        background: '#1E2025', // Dark background for 'dark' theme
        text: '#FFFFFF', // White text for dark theme
        neon: {
          pink: '#FF6EC7',
          blue: '#00F3FF',
          green: '#39FF14',
          yellow: '#FFFF00',
          purple: '#BD00FF',
        },
        disco: {
          dark: '#1A1A1A',
          light: '#2A2A2A',
        },
      },
      boxShadow: {
        neon: '0 0 5px #00F3FF, 0 0 20px #00F3FF',
      },
    },
  },
  plugins: [],
};

export default config;